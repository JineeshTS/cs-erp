import {
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
  DescribeStackEventsCommand,
  type StackEvent,
} from "@aws-sdk/client-cloudformation";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { eq, and, isNull, desc } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";
import { awsCredentials, awsDeployments } from "@/db/schema";
import { encrypt, decrypt } from "@/lib/crypto";

// Instance size → AWS resource mapping
const INSTANCE_SIZE_MAP: Record<
  string,
  { cpu: string; memory: string; rdsClass: string; cacheNodeType: string }
> = {
  small: {
    cpu: "512",
    memory: "1024",
    rdsClass: "db.t3.micro",
    cacheNodeType: "cache.t3.micro",
  },
  medium: {
    cpu: "1024",
    memory: "2048",
    rdsClass: "db.t3.small",
    cacheNodeType: "cache.t3.small",
  },
  large: {
    cpu: "2048",
    memory: "4096",
    rdsClass: "db.t3.medium",
    cacheNodeType: "cache.t3.medium",
  },
  xlarge: {
    cpu: "4096",
    memory: "8192",
    rdsClass: "db.r6g.large",
    cacheNodeType: "cache.r6g.large",
  },
};

// CF resource type → UI step mapping
const RESOURCE_STEP_MAP: Record<string, string> = {
  "AWS::EC2::VPC": "infra",
  "AWS::EC2::Subnet": "infra",
  "AWS::EC2::InternetGateway": "infra",
  "AWS::EC2::NatGateway": "infra",
  "AWS::EC2::SecurityGroup": "infra",
  "AWS::EC2::RouteTable": "infra",
  "AWS::RDS::DBInstance": "db",
  "AWS::RDS::DBSubnetGroup": "db",
  "AWS::ElastiCache::CacheCluster": "cache",
  "AWS::ElastiCache::SubnetGroup": "cache",
  "AWS::ECS::Cluster": "compute",
  "AWS::ECS::Service": "compute",
  "AWS::ECS::TaskDefinition": "compute",
  "AWS::ElasticLoadBalancingV2::LoadBalancer": "compute",
  "AWS::ElasticLoadBalancingV2::TargetGroup": "compute",
  "AWS::ElasticLoadBalancingV2::Listener": "compute",
  "AWS::WAFv2::WebACL": "security",
  "AWS::CertificateManager::Certificate": "security",
  "AWS::IAM::Role": "security",
  "AWS::Route53::RecordSet": "dns",
  "AWS::CloudFront::Distribution": "dns",
};

function buildCfClient(
  accessKeyId: string,
  secretAccessKey: string,
  region: string
): CloudFormationClient {
  return new CloudFormationClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Validate AWS credentials by calling STS GetCallerIdentity.
 */
async function validateWithSts(
  accessKeyId: string,
  secretAccessKey: string,
  region: string
): Promise<{ valid: boolean; accountId?: string; error?: string }> {
  try {
    const sts = new STSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    const result = await sts.send(new GetCallerIdentityCommand({}));
    return { valid: true, accountId: result.Account };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Invalid credentials",
    };
  }
}

/**
 * Save (encrypt) AWS credentials after STS validation.
 */
export async function saveCredentials(
  tenantId: string,
  data: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    label: string;
  }
) {
  // Validate first
  const validation = await validateWithSts(
    data.accessKeyId,
    data.secretAccessKey,
    data.region
  );
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Encrypt each field independently
  const encryptedAccessKeyId = encrypt(data.accessKeyId);
  const encryptedSecretAccessKey = encrypt(data.secretAccessKey);

  // Upsert: soft-delete existing with same label, then insert
  const [existing] = await db
    .select({ id: awsCredentials.id })
    .from(awsCredentials)
    .where(
      and(
        eq(awsCredentials.tenantId, tenantId),
        eq(awsCredentials.label, data.label),
        isNull(awsCredentials.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(awsCredentials)
      .set({
        encryptedAccessKeyId,
        encryptedSecretAccessKey,
        region: data.region,
        isValid: true,
        lastValidatedAt: new Date(),
      })
      .where(eq(awsCredentials.id, existing.id));

    return { success: true, credentialId: existing.id, accountId: validation.accountId };
  }

  const [created] = await db
    .insert(awsCredentials)
    .values({
      tenantId,
      label: data.label,
      encryptedAccessKeyId,
      encryptedSecretAccessKey,
      region: data.region,
      isValid: true,
      lastValidatedAt: new Date(),
    })
    .returning();

  return { success: true, credentialId: created.id, accountId: validation.accountId };
}

/**
 * Get credential metadata (never returns secret keys).
 */
export async function getCredentialStatus(tenantId: string) {
  const creds = await db
    .select({
      id: awsCredentials.id,
      label: awsCredentials.label,
      region: awsCredentials.region,
      isValid: awsCredentials.isValid,
      lastValidatedAt: awsCredentials.lastValidatedAt,
      createdAt: awsCredentials.createdAt,
    })
    .from(awsCredentials)
    .where(
      and(
        eq(awsCredentials.tenantId, tenantId),
        isNull(awsCredentials.deletedAt)
      )
    )
    .orderBy(desc(awsCredentials.createdAt));

  return creds;
}

/**
 * Read the CloudFormation template from disk.
 */
function loadCfTemplate(): string {
  const templatePath = join(process.cwd(), "cloudformation", "cs-erp-stack.yaml");
  return readFileSync(templatePath, "utf-8");
}

/**
 * Trigger a CloudFormation stack deployment.
 */
export async function triggerDeployment(
  tenantId: string,
  userId: string,
  data: {
    region: string;
    instanceSize: string;
    customDomain: string;
    enableBackups: boolean;
    enableMonitoring: boolean;
  }
) {
  // Get credentials
  const [cred] = await db
    .select()
    .from(awsCredentials)
    .where(
      and(
        eq(awsCredentials.tenantId, tenantId),
        eq(awsCredentials.isValid, true),
        isNull(awsCredentials.deletedAt)
      )
    )
    .orderBy(desc(awsCredentials.createdAt))
    .limit(1);

  if (!cred) {
    return { success: false, error: "No valid AWS credentials found. Please save credentials first." };
  }

  const accessKeyId = decrypt(cred.encryptedAccessKeyId);
  const secretAccessKey = decrypt(cred.encryptedSecretAccessKey);

  const sizeConfig = INSTANCE_SIZE_MAP[data.instanceSize];
  if (!sizeConfig) {
    return { success: false, error: "Invalid instance size" };
  }

  const stackName = `cs-erp-${tenantId.slice(0, 8)}-${Date.now()}`;
  const templateBody = loadCfTemplate();

  const cf = buildCfClient(accessKeyId, secretAccessKey, data.region);

  try {
    const result = await cf.send(
      new CreateStackCommand({
        StackName: stackName,
        TemplateBody: templateBody,
        Capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
        Parameters: [
          { ParameterKey: "TenantId", ParameterValue: tenantId.slice(0, 8) },
          { ParameterKey: "InstanceCpu", ParameterValue: sizeConfig.cpu },
          { ParameterKey: "InstanceMemory", ParameterValue: sizeConfig.memory },
          { ParameterKey: "RdsInstanceClass", ParameterValue: sizeConfig.rdsClass },
          { ParameterKey: "CacheNodeType", ParameterValue: sizeConfig.cacheNodeType },
          { ParameterKey: "CustomDomain", ParameterValue: data.customDomain || "" },
          { ParameterKey: "EnableBackups", ParameterValue: data.enableBackups ? "true" : "false" },
          { ParameterKey: "EnableMonitoring", ParameterValue: data.enableMonitoring ? "true" : "false" },
        ],
        Tags: [
          { Key: "Project", Value: "cs-erp" },
          { Key: "TenantId", Value: tenantId },
          { Key: "ManagedBy", Value: "cs-erp-admin-portal" },
        ],
      })
    );

    const [deployment] = await db
      .insert(awsDeployments)
      .values({
        tenantId,
        credentialId: cred.id,
        stackName,
        stackId: result.StackId,
        region: data.region,
        instanceSize: data.instanceSize,
        customDomain: data.customDomain || null,
        enableBackups: data.enableBackups,
        enableMonitoring: data.enableMonitoring,
        status: "creating",
        startedAt: new Date(),
        initiatedBy: userId,
      })
      .returning();

    return { success: true, deploymentId: deployment.id, stackId: result.StackId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create CloudFormation stack",
    };
  }
}

/**
 * Get deployment status, polling CF if still in-progress.
 */
export async function getDeploymentStatus(
  tenantId: string,
  deploymentId: string
) {
  const [deployment] = await db
    .select()
    .from(awsDeployments)
    .where(
      and(
        eq(awsDeployments.id, deploymentId),
        eq(awsDeployments.tenantId, tenantId),
        isNull(awsDeployments.deletedAt)
      )
    )
    .limit(1);

  if (!deployment) return null;

  // If still in-progress, poll CF for latest status
  if (
    deployment.status === "creating" ||
    deployment.status === "updating" ||
    deployment.status === "deleting"
  ) {
    const [cred] = await db
      .select()
      .from(awsCredentials)
      .where(eq(awsCredentials.id, deployment.credentialId))
      .limit(1);

    if (cred) {
      try {
        const accessKeyId = decrypt(cred.encryptedAccessKeyId);
        const secretAccessKey = decrypt(cred.encryptedSecretAccessKey);
        const cf = buildCfClient(accessKeyId, secretAccessKey, deployment.region);

        const result = await cf.send(
          new DescribeStacksCommand({ StackName: deployment.stackName })
        );

        const stack = result.Stacks?.[0];
        if (stack) {
          const cfStatus = stack.StackStatus ?? "UNKNOWN";
          let appStatus = deployment.status;
          let completedAt = deployment.completedAt;
          let outputs = deployment.outputs;
          let deployedUrl = deployment.deployedUrl;
          let statusReason = deployment.statusReason;

          if (cfStatus === "CREATE_COMPLETE" || cfStatus === "UPDATE_COMPLETE") {
            appStatus = "complete";
            completedAt = new Date();
            const outputMap: Record<string, string> = {};
            for (const o of stack.Outputs ?? []) {
              if (o.OutputKey && o.OutputValue) {
                outputMap[o.OutputKey] = o.OutputValue;
              }
            }
            outputs = outputMap;
            deployedUrl = outputMap.ApplicationUrl || deployedUrl;
          } else if (cfStatus.includes("FAILED") || cfStatus.includes("ROLLBACK")) {
            appStatus = "failed";
            completedAt = new Date();
            statusReason = stack.StackStatusReason ?? cfStatus;
          } else if (cfStatus === "DELETE_COMPLETE") {
            appStatus = "deleted";
            completedAt = new Date();
          }

          if (appStatus !== deployment.status) {
            await db
              .update(awsDeployments)
              .set({
                status: appStatus,
                statusReason,
                outputs,
                deployedUrl,
                completedAt,
              })
              .where(eq(awsDeployments.id, deploymentId));
          }

          return { ...deployment, status: appStatus, statusReason, outputs, deployedUrl, completedAt };
        }
      } catch (err) {
        console.error("Failed to poll CF stack:", err);
      }
    }
  }

  return deployment;
}

export type DeployStepEvent = {
  step: string;
  status: "running" | "done" | "error";
  message: string;
  timestamp: string;
};

/**
 * Async generator that yields CF stack events mapped to UI steps.
 * Polls every 5 seconds until the stack reaches a terminal state.
 */
export async function* streamStackEvents(
  tenantId: string,
  deploymentId: string
): AsyncGenerator<DeployStepEvent> {
  const [deployment] = await db
    .select()
    .from(awsDeployments)
    .where(
      and(
        eq(awsDeployments.id, deploymentId),
        eq(awsDeployments.tenantId, tenantId),
        isNull(awsDeployments.deletedAt)
      )
    )
    .limit(1);

  if (!deployment) return;

  const [cred] = await db
    .select()
    .from(awsCredentials)
    .where(eq(awsCredentials.id, deployment.credentialId))
    .limit(1);

  if (!cred) return;

  const accessKeyId = decrypt(cred.encryptedAccessKeyId);
  const secretAccessKey = decrypt(cred.encryptedSecretAccessKey);
  const cf = buildCfClient(accessKeyId, secretAccessKey, deployment.region);

  const seenEventIds = new Set<string>();
  const completedSteps = new Set<string>();
  let terminal = false;

  while (!terminal) {
    try {
      const events = await cf.send(
        new DescribeStackEventsCommand({ StackName: deployment.stackName })
      );

      for (const event of (events.StackEvents ?? []).reverse()) {
        const eventId = event.EventId ?? "";
        if (seenEventIds.has(eventId)) continue;
        seenEventIds.add(eventId);

        const resourceType = event.ResourceType ?? "";
        const resourceStatus = event.ResourceStatus ?? "";
        const step = RESOURCE_STEP_MAP[resourceType];

        if (step) {
          if (resourceStatus.endsWith("_COMPLETE") && !resourceStatus.includes("DELETE")) {
            if (!completedSteps.has(step)) {
              completedSteps.add(step);
              yield {
                step,
                status: "done",
                message: `${resourceType} ${resourceStatus}`,
                timestamp: (event.Timestamp ?? new Date()).toISOString(),
              };
            }
          } else if (resourceStatus.endsWith("_IN_PROGRESS") && !resourceStatus.includes("DELETE")) {
            yield {
              step,
              status: "running",
              message: `${resourceType} ${resourceStatus}`,
              timestamp: (event.Timestamp ?? new Date()).toISOString(),
            };
          } else if (resourceStatus.endsWith("_FAILED")) {
            yield {
              step,
              status: "error",
              message: event.ResourceStatusReason ?? `${resourceType} ${resourceStatus}`,
              timestamp: (event.Timestamp ?? new Date()).toISOString(),
            };
          }
        }

        // Check for terminal stack-level events
        if (
          resourceType === "AWS::CloudFormation::Stack" &&
          (resourceStatus === "CREATE_COMPLETE" ||
            resourceStatus === "CREATE_FAILED" ||
            resourceStatus === "ROLLBACK_COMPLETE" ||
            resourceStatus === "DELETE_COMPLETE")
        ) {
          terminal = true;
        }
      }
    } catch (err) {
      console.error("Error polling stack events:", err);
      terminal = true;
    }

    if (!terminal) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Update final status
  await getDeploymentStatus(tenantId, deploymentId);
}

/**
 * Tear down a deployment by deleting the CloudFormation stack.
 */
export async function deleteDeployment(
  tenantId: string,
  deploymentId: string
) {
  const [deployment] = await db
    .select()
    .from(awsDeployments)
    .where(
      and(
        eq(awsDeployments.id, deploymentId),
        eq(awsDeployments.tenantId, tenantId),
        isNull(awsDeployments.deletedAt)
      )
    )
    .limit(1);

  if (!deployment) {
    return { success: false, error: "Deployment not found" };
  }

  const [cred] = await db
    .select()
    .from(awsCredentials)
    .where(eq(awsCredentials.id, deployment.credentialId))
    .limit(1);

  if (!cred) {
    return { success: false, error: "Credentials not found" };
  }

  const accessKeyId = decrypt(cred.encryptedAccessKeyId);
  const secretAccessKey = decrypt(cred.encryptedSecretAccessKey);
  const cf = buildCfClient(accessKeyId, secretAccessKey, deployment.region);

  try {
    await cf.send(new DeleteStackCommand({ StackName: deployment.stackName }));

    await db
      .update(awsDeployments)
      .set({ status: "deleting" })
      .where(eq(awsDeployments.id, deploymentId));

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete stack",
    };
  }
}
