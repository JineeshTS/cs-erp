import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiAgentModelAssignments, aiModels } from "@/db/schema";
import { aafAgents } from "@/db/schema/ai-agent-framework";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const assignments = await db
      .select({
        id: aiAgentModelAssignments.id,
        tenantId: aiAgentModelAssignments.tenantId,
        agentId: aiAgentModelAssignments.agentId,
        modelId: aiAgentModelAssignments.modelId,
        fallbackModelId: aiAgentModelAssignments.fallbackModelId,
        temperature: aiAgentModelAssignments.temperature,
        maxOutputTokens: aiAgentModelAssignments.maxOutputTokens,
        systemPrompt: aiAgentModelAssignments.systemPrompt,
        isActive: aiAgentModelAssignments.isActive,
        metadata: aiAgentModelAssignments.metadata,
        createdAt: aiAgentModelAssignments.createdAt,
        updatedAt: aiAgentModelAssignments.updatedAt,
        agentName: aafAgents.agentName,
        modelName: aiModels.displayName,
      })
      .from(aiAgentModelAssignments)
      .innerJoin(aafAgents, eq(aiAgentModelAssignments.agentId, aafAgents.id))
      .innerJoin(aiModels, eq(aiAgentModelAssignments.modelId, aiModels.id))
      .where(
        and(
          eq(aiAgentModelAssignments.tenantId, user.tenantId),
          isNull(aiAgentModelAssignments.deletedAt)
        )
      );

    return NextResponse.json({ data: assignments, meta: { total: assignments.length } });
  } catch (error) {
    console.error("GET /api/v1/admin/ai-agent-configs error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

const upsertAssignmentSchema = z.object({
  agentId: z.string().uuid(),
  modelId: z.string().uuid(),
  fallbackModelId: z.string().uuid().optional().nullable(),
  temperature: z.string().optional(),
  maxOutputTokens: z.number().int().positive().optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "ai:edit"))) {
      return forbiddenResponse();
    }

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = upsertAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { agentId, modelId, fallbackModelId, temperature, maxOutputTokens, systemPrompt } = parsed.data;

    // Check if assignment already exists for this agent
    const [existing] = await db
      .select({ id: aiAgentModelAssignments.id })
      .from(aiAgentModelAssignments)
      .where(
        and(
          eq(aiAgentModelAssignments.tenantId, user.tenantId),
          eq(aiAgentModelAssignments.agentId, agentId),
          isNull(aiAgentModelAssignments.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing assignment
      const [updated] = await db
        .update(aiAgentModelAssignments)
        .set({
          modelId,
          fallbackModelId: fallbackModelId ?? null,
          temperature: temperature ?? "0.70",
          maxOutputTokens: maxOutputTokens ?? null,
          systemPrompt: systemPrompt ?? null,
        })
        .where(eq(aiAgentModelAssignments.id, existing.id))
        .returning();

      return NextResponse.json({ data: updated });
    }

    // Create new assignment
    const [assignment] = await db
      .insert(aiAgentModelAssignments)
      .values({
        tenantId: user.tenantId,
        agentId,
        modelId,
        fallbackModelId: fallbackModelId ?? null,
        temperature: temperature ?? "0.70",
        maxOutputTokens: maxOutputTokens ?? null,
        systemPrompt: systemPrompt ?? null,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "ai-agent-configs", entityId: assignment?.id, module: "admin", newData: assignment as Record<string, unknown>, request });

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/ai-agent-configs error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
