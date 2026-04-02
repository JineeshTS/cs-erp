import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, asc } from "drizzle-orm";
import { wneWorkflows, wneWorkflowSteps } from "@/db/schema";
import { ProcessStudioClient } from "./client";

export default async function ProcessStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "workflows:read")))
    redirect("/workflow-notification-engine");

  const { id } = await params;

  const [workflow] = await db
    .select()
    .from(wneWorkflows)
    .where(
      and(
        eq(wneWorkflows.id, id),
        eq(wneWorkflows.tenantId, session.tenantId),
        isNull(wneWorkflows.deletedAt)
      )
    )
    .limit(1);

  if (!workflow) redirect("/workflow-notification-engine/workflows");

  const steps = await db
    .select()
    .from(wneWorkflowSteps)
    .where(
      and(
        eq(wneWorkflowSteps.workflowId, id),
        eq(wneWorkflowSteps.tenantId, session.tenantId),
        isNull(wneWorkflowSteps.deletedAt)
      )
    )
    .orderBy(asc(wneWorkflowSteps.stepOrder));

  // Extract visual layout from workflow metadata, or build default from steps
  const meta = (workflow.metadata || {}) as Record<string, unknown>;
  const visualLayout = meta.visualLayout as { nodes: unknown[]; edges: unknown[] } | undefined;

  let initialNodes: unknown[];
  let initialEdges: unknown[];

  if (visualLayout?.nodes?.length) {
    initialNodes = visualLayout.nodes;
    initialEdges = visualLayout.edges || [];
  } else {
    // Generate default layout from step definitions
    initialNodes = [
      { id: "start", type: "start", position: { x: 250, y: 0 }, data: {} },
      ...steps.map((s, i) => ({
        id: s.id,
        type: s.stepType === "approval" ? "approval_gate" : "user_task",
        position: { x: 200, y: 100 + i * 120 },
        data: {
          label: s.name,
          assigneeType: s.assigneeType,
          assignee: s.assigneeValue,
          requiredApprovals: s.requiredApprovals,
        },
      })),
      { id: "end", type: "end", position: { x: 250, y: 100 + steps.length * 120 }, data: {} },
    ];
    // Auto-connect in sequence
    const nodeIds = initialNodes.map((n: any) => n.id);
    initialEdges = nodeIds.slice(0, -1).map((source: string, i: number) => ({
      id: `edge_${source}_${nodeIds[i + 1]}`,
      source,
      target: nodeIds[i + 1],
      markerEnd: { type: "arrowclosed", width: 16, height: 16 },
      style: { strokeWidth: 2 },
    }));
  }

  return (
    <ProcessStudioClient
      workflowId={workflow.id}
      workflowName={workflow.name}
      initialNodes={initialNodes as any[]}
      initialEdges={initialEdges as any[]}
    />
  );
}
