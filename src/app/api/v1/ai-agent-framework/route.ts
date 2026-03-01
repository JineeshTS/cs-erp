import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  aafAgents,
  aafAgentRuns,
  aafOrchestrationTasks,
  aafDocumentProcessingJobs,
  aafWorkflowDefinitions,
  aafWorkflowInstances,
  aafEscalations,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ai:read")))
      return forbiddenResponse();

    const [
      [agents],
      [runs],
      [orchTasks],
      [docJobs],
      [wfDefs],
      [wfInstances],
      [escalations],
    ] = await Promise.all([
      db.select({ count: count() }).from(aafAgents).where(and(eq(aafAgents.tenantId, user.tenantId), isNull(aafAgents.deletedAt))),
      db.select({ count: count() }).from(aafAgentRuns).where(and(eq(aafAgentRuns.tenantId, user.tenantId), isNull(aafAgentRuns.deletedAt))),
      db.select({ count: count() }).from(aafOrchestrationTasks).where(and(eq(aafOrchestrationTasks.tenantId, user.tenantId), isNull(aafOrchestrationTasks.deletedAt))),
      db.select({ count: count() }).from(aafDocumentProcessingJobs).where(and(eq(aafDocumentProcessingJobs.tenantId, user.tenantId), isNull(aafDocumentProcessingJobs.deletedAt))),
      db.select({ count: count() }).from(aafWorkflowDefinitions).where(and(eq(aafWorkflowDefinitions.tenantId, user.tenantId), isNull(aafWorkflowDefinitions.deletedAt))),
      db.select({ count: count() }).from(aafWorkflowInstances).where(and(eq(aafWorkflowInstances.tenantId, user.tenantId), isNull(aafWorkflowInstances.deletedAt))),
      db.select({ count: count() }).from(aafEscalations).where(and(eq(aafEscalations.tenantId, user.tenantId), isNull(aafEscalations.deletedAt))),
    ]);

    return NextResponse.json({
      data: {
        agents: agents.count,
        agentRuns: runs.count,
        orchestrationTasks: orchTasks.count,
        documentProcessingJobs: docJobs.count,
        workflowDefinitions: wfDefs.count,
        workflowInstances: wfInstances.count,
        escalations: escalations.count,
      },
    });
  } catch (error) {
    console.error("Failed to get AAF summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
