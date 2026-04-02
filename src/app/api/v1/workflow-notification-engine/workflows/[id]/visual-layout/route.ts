import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { wneWorkflows, wneWorkflowSteps } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";

const layoutSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.string(), z.unknown()),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional().nullable(),
    targetHandle: z.string().optional().nullable(),
    markerEnd: z.unknown().optional(),
    style: z.record(z.string(), z.unknown()).optional(),
    label: z.string().optional(),
  })),
});

/**
 * PUT /api/v1/workflow-notification-engine/workflows/[id]/visual-layout
 *
 * ERP-041: Save the visual BPMN layout (nodes + edges) into workflow metadata,
 * and sync step definitions from the visual nodes.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflow:create"))) return forbiddenResponse();

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = layoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid layout", details: parsed.error } },
        { status: 400 }
      );
    }

    const { nodes, edges } = parsed.data;

    // Verify workflow exists and belongs to tenant
    const [workflow] = await db
      .select({ id: wneWorkflows.id, metadata: wneWorkflows.metadata })
      .from(wneWorkflows)
      .where(and(
        eq(wneWorkflows.id, id),
        eq(wneWorkflows.tenantId, user.tenantId),
        isNull(wneWorkflows.deletedAt),
      ))
      .limit(1);

    if (!workflow) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Workflow not found" } },
        { status: 404 }
      );
    }

    // Save visual layout into metadata
    const existingMeta = (workflow.metadata || {}) as Record<string, unknown>;
    const updatedMeta = { ...existingMeta, visualLayout: { nodes, edges } };

    await db
      .update(wneWorkflows)
      .set({
        metadata: updatedMeta,
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(wneWorkflows.id, id));

    // Sync workflow steps from visual nodes (exclude start/end/gateway)
    const stepNodes = nodes.filter(
      (n) => n.type && !["start", "end", "gateway"].includes(n.type)
    );

    // Soft-delete existing steps
    await db
      .update(wneWorkflowSteps)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(wneWorkflowSteps.workflowId, id),
        eq(wneWorkflowSteps.tenantId, user.tenantId),
      ));

    // Insert new steps from visual nodes
    for (let i = 0; i < stepNodes.length; i++) {
      const node = stepNodes[i];
      const data = node.data as Record<string, unknown>;
      const stepType = node.type === "approval_gate" ? "approval"
        : node.type === "service_task" ? "service"
        : node.type === "timer_event" ? "timer"
        : "human";

      await db.insert(wneWorkflowSteps).values({
        tenantId: user.tenantId,
        workflowId: id,
        name: (data.label as string) || `Step ${i + 1}`,
        stepOrder: i + 1,
        stepType,
        assigneeType: (data.assigneeType as string) || "role",
        assigneeValue: (data.assignee as string) || "any",
        requiredApprovals: (data.requiredApprovals as number) || 1,
        autoApproveAfterHours: (data.durationHours as number) || null,
        conditions: data.condition ? { expression: data.condition } : null,
        metadata: {
          visualNodeId: node.id,
          nodeType: node.type,
          apiEndpoint: data.apiEndpoint || null,
          description: data.description || null,
        },
        createdBy: user.id,
        updatedBy: user.id,
      });
    }

    return NextResponse.json({
      data: { saved: true, stepCount: stepNodes.length },
    });
  } catch (error) {
    console.error("[visual-layout] Save error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to save layout" } },
      { status: 500 }
    );
  }
}
