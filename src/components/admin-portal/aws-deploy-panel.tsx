"use client";

import { useState, useEffect, useCallback } from "react";
import { getCsrfToken } from "@/lib/client/csrf";
import {
  Cloud,
  Server,
  Database,
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Rocket,
  Globe,
  HardDrive,
  Cpu,
  Info,
  Key,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

type DeployStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "running" | "done" | "error";
};

type AwsRegion = {
  value: string;
  label: string;
};

const AWS_REGIONS: AwsRegion[] = [
  { value: "me-south-1", label: "Middle East (Bahrain)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

type InstanceSize = {
  value: string;
  label: string;
  specs: string;
  recommended?: boolean;
};

const INSTANCE_SIZES: InstanceSize[] = [
  { value: "small", label: "Small", specs: "2 vCPU, 4 GB RAM, 50 GB SSD" },
  { value: "medium", label: "Medium", specs: "4 vCPU, 8 GB RAM, 100 GB SSD", recommended: true },
  { value: "large", label: "Large", specs: "8 vCPU, 16 GB RAM, 200 GB SSD" },
  { value: "xlarge", label: "X-Large", specs: "16 vCPU, 32 GB RAM, 500 GB SSD" },
];

const INITIAL_STEPS: DeployStep[] = [
  { id: "infra", label: "Provisioning Infrastructure", description: "Creating VPC, subnets, and security groups", icon: Server, status: "pending" },
  { id: "db", label: "Setting Up Database", description: "Launching RDS PostgreSQL with multi-AZ", icon: Database, status: "pending" },
  { id: "cache", label: "Configuring Cache", description: "Deploying ElastiCache Redis cluster", icon: HardDrive, status: "pending" },
  { id: "compute", label: "Deploying Application", description: "Building and deploying ECS containers", icon: Cpu, status: "pending" },
  { id: "security", label: "Applying Security", description: "Configuring SSL, WAF, and IAM policies", icon: Shield, status: "pending" },
  { id: "dns", label: "Setting Up Domain", description: "Configuring Route 53 and CloudFront CDN", icon: Globe, status: "pending" },
];

type CredentialInfo = {
  id: string;
  label: string;
  region: string;
  isValid: boolean;
  lastValidatedAt: string | null;
  createdAt: string;
};

interface AwsDeployPanelProps {
  tenantId: string;
}

export function AwsDeployPanel({ tenantId }: AwsDeployPanelProps) {
  const [region, setRegion] = useState("me-south-1");
  const [instanceSize, setInstanceSize] = useState("medium");
  const [customDomain, setCustomDomain] = useState("");
  const [enableBackups, setEnableBackups] = useState(true);
  const [enableMonitoring, setEnableMonitoring] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployComplete, setDeployComplete] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [steps, setSteps] = useState<DeployStep[]>(INITIAL_STEPS);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);

  // Credentials state
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [showCredForm, setShowCredForm] = useState(false);
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [credLabel, setCredLabel] = useState("Default");
  const [credRegion, setCredRegion] = useState("me-south-1");
  const [savingCreds, setSavingCreds] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [tearingDown, setTearingDown] = useState(false);

  const fetchCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/aws-deploy/credentials", { credentials: "include" });
      const json = await res.json();
      if (json.data) {
        setCredentials(json.data);
        setShowCredForm(json.data.length === 0);
      }
    } catch {
      // silently fail on mount
    } finally {
      setCredentialsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  async function handleSaveCredentials() {
    setSavingCreds(true);
    setCredError(null);
    try {
      const res = await fetch("/api/v1/admin/aws-deploy/credentials", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({
          accessKeyId,
          secretAccessKey,
          region: credRegion,
          label: credLabel,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCredError(json.error?.message ?? "Failed to save credentials");
        return;
      }
      setAccessKeyId("");
      setSecretAccessKey("");
      setShowCredForm(false);
      await fetchCredentials();
    } catch {
      setCredError("Network error");
    } finally {
      setSavingCreds(false);
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployError(null);
    setDeployComplete(false);
    setSteps(INITIAL_STEPS);
    setDeployedUrl(null);

    try {
      // Trigger deployment
      const res = await fetch("/api/v1/admin/aws-deploy", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({
          region,
          instanceSize,
          customDomain,
          enableBackups,
          enableMonitoring,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setDeployError(json.error?.message ?? "Deployment failed");
        setDeploying(false);
        return;
      }

      const depId = json.data.deploymentId;
      setDeploymentId(depId);

      // Open SSE stream for real-time progress
      const eventSource = new EventSource(`/api/v1/admin/aws-deploy/${depId}/stream`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.step === "_done") {
          eventSource.close();
          setDeploying(false);
          setDeployComplete(true);
          // Fetch final status for URL
          fetch(`/api/v1/admin/aws-deploy/${depId}`, { credentials: "include" })
            .then((r) => r.json())
            .then((r) => {
              if (r.data?.deployedUrl) setDeployedUrl(r.data.deployedUrl);
              if (r.data?.status === "failed") {
                setDeployError(r.data.statusReason ?? "Deployment failed");
                setDeployComplete(false);
              }
            });
          return;
        }

        if (data.step === "_error") {
          eventSource.close();
          setDeployError("Deployment stream failed");
          setDeploying(false);
          return;
        }

        // Map event to step status
        setSteps((prev) =>
          prev.map((s) =>
            s.id === data.step ? { ...s, status: data.status } : s
          )
        );
      };

      eventSource.onerror = () => {
        eventSource.close();
        // Don't mark as error yet — the deployment might still be running
        // Poll for final status
        fetch(`/api/v1/admin/aws-deploy/${depId}`, { credentials: "include" })
          .then((r) => r.json())
          .then((r) => {
            if (r.data?.status === "complete") {
              setDeployComplete(true);
              setDeployedUrl(r.data.deployedUrl);
            } else if (r.data?.status === "failed") {
              setDeployError(r.data.statusReason ?? "Deployment failed");
            }
          })
          .finally(() => setDeploying(false));
      };
    } catch {
      setDeployError("Network error — please check your connection");
      setDeploying(false);
    }
  }

  async function handleTearDown() {
    if (!deploymentId) return;
    setTearingDown(true);
    try {
      const res = await fetch(`/api/v1/admin/aws-deploy/${deploymentId}`, {
        credentials: "include",
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
      });
      const json = await res.json();
      if (res.ok) {
        setDeployComplete(false);
        setDeployedUrl(null);
        setSteps(INITIAL_STEPS);
        setDeploymentId(null);
      } else {
        setDeployError(json.error?.message ?? "Tear down failed");
      }
    } catch {
      setDeployError("Network error");
    } finally {
      setTearingDown(false);
    }
  }

  const hasCredentials = credentials.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuration Panel */}
      <div className="space-y-6">
        {/* AWS Credentials Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Key className="h-5 w-5 text-gray-500" />
                AWS Credentials
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {hasCredentials
                  ? "Credentials configured and validated"
                  : "Enter your AWS credentials to enable deployment"}
              </p>
            </div>
            {hasCredentials && !showCredForm && (
              <button
                onClick={() => setShowCredForm(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Update
              </button>
            )}
          </div>

          {credentialsLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking credentials...
            </div>
          ) : hasCredentials && !showCredForm ? (
            <div className="mt-4 space-y-2">
              {credentials.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md bg-green-50 px-4 py-2 border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{c.label}</span>
                    <span className="text-xs text-green-600">({c.region})</span>
                  </div>
                  <span className="text-xs text-green-600">
                    Validated {c.lastValidatedAt ? new Date(c.lastValidatedAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="credLabel" className="block text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  id="credLabel"
                  type="text"
                  value={credLabel}
                  onChange={(e) => setCredLabel(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700">
                  Access Key ID
                </label>
                <input
                  id="accessKeyId"
                  type="text"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700">
                  Secret Access Key
                </label>
                <div className="relative mt-1">
                  <input
                    id="secretAccessKey"
                    type={showSecret ? "text" : "password"}
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pe-10 text-sm font-mono shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="credRegion" className="block text-sm font-medium text-gray-700">
                  Default Region
                </label>
                <select
                  id="credRegion"
                  value={credRegion}
                  onChange={(e) => setCredRegion(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              {credError && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{credError}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCredentials}
                  disabled={savingCreds || !accessKeyId || !secretAccessKey}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingCreds ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Save & Validate
                    </>
                  )}
                </button>
                {hasCredentials && (
                  <button
                    onClick={() => setShowCredForm(false)}
                    className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Deployment Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Deployment Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">Configure your AWS deployment settings</p>

          <div className="mt-6 space-y-5">
            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                AWS Region
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={deploying}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {AWS_REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Instance Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instance Size
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {INSTANCE_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setInstanceSize(size.value)}
                    disabled={deploying}
                    className={`relative rounded-lg border p-3 text-start transition-all ${
                      instanceSize === size.value
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    } disabled:opacity-50`}
                  >
                    {size.recommended && (
                      <span className="absolute -top-2 end-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                        Recommended
                      </span>
                    )}
                    <span className="block text-sm font-medium text-gray-900">{size.label}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">{size.specs}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Domain */}
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Custom Domain (optional)
              </label>
              <input
                id="domain"
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="erp.yourcompany.com"
                disabled={deploying}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enableBackups}
                  onChange={(e) => setEnableBackups(e.target.checked)}
                  disabled={deploying}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Automated daily backups (7-day retention)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enableMonitoring}
                  onChange={(e) => setEnableMonitoring(e.target.checked)}
                  disabled={deploying}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">CloudWatch monitoring and alerts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">What gets deployed?</p>
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-blue-700">
              <li>Full CS-ERP application (Next.js on ECS Fargate)</li>
              <li>PostgreSQL RDS with multi-AZ failover</li>
              <li>Redis ElastiCache for caching and sessions</li>
              <li>CloudFront CDN with SSL certificate</li>
              <li>WAF firewall with OWASP rules</li>
              <li>VPC with private subnets and NAT gateway</li>
            </ul>
          </div>
        </div>

        {/* Deploy button */}
        <button
          onClick={handleDeploy}
          disabled={deploying || deployComplete || !hasCredentials}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {deploying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Deploying...
            </>
          ) : deployComplete ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Deployment Complete
            </>
          ) : !hasCredentials ? (
            <>
              <Key className="h-5 w-5" />
              Save AWS Credentials First
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              Deploy to AWS
            </>
          )}
        </button>
      </div>

      {/* Deployment Progress Panel */}
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Deployment Progress</h2>
          <p className="mt-1 text-sm text-gray-500">
            {deploying
              ? "Deploying your infrastructure..."
              : deployComplete
                ? "All resources deployed successfully"
                : "Click deploy to begin"}
          </p>

          <div className="mt-6 space-y-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
                    step.status === "running"
                      ? "border-blue-300 bg-blue-50"
                      : step.status === "done"
                        ? "border-green-200 bg-green-50"
                        : step.status === "error"
                          ? "border-red-200 bg-red-50"
                          : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="shrink-0 pt-0.5">
                    {step.status === "running" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : step.status === "done" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.status === "error" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <StepIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        step.status === "done"
                          ? "text-green-800"
                          : step.status === "running"
                            ? "text-blue-800"
                            : step.status === "error"
                              ? "text-red-800"
                              : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs ${
                        step.status === "done"
                          ? "text-green-600"
                          : step.status === "running"
                            ? "text-blue-600"
                            : step.status === "error"
                              ? "text-red-600"
                              : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success panel */}
        {deployComplete && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Deployment Successful</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {deployedUrl && (
                <div className="flex items-center justify-between rounded-md bg-white px-4 py-2 border border-green-200">
                  <span className="text-gray-600">Application URL</span>
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {deployedUrl}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between rounded-md bg-white px-4 py-2 border border-green-200">
                <span className="text-gray-600">Region</span>
                <span className="font-medium text-gray-900">
                  {AWS_REGIONS.find((r) => r.value === region)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-4 py-2 border border-green-200">
                <span className="text-gray-600">Instance</span>
                <span className="font-medium text-gray-900">
                  {INSTANCE_SIZES.find((s) => s.value === instanceSize)?.label} — {INSTANCE_SIZES.find((s) => s.value === instanceSize)?.specs}
                </span>
              </div>
            </div>
            {/* Tear Down button */}
            <button
              onClick={handleTearDown}
              disabled={tearingDown}
              className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {tearingDown ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tearing down...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Tear Down Stack
                </>
              )}
            </button>
          </div>
        )}

        {/* Error panel */}
        {deployError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Deployment Failed</h3>
            </div>
            <p className="mt-2 text-sm text-red-700">{deployError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
