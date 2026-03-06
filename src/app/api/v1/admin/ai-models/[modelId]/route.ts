import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiModels } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

type RouteParams = { params: Promise<{ modelId: string }> };

const updateModelSchema = z.object({
  displayName: z.string().min(1).max(150).optional(),
  modelType: z.string().min(1).max(30).optional(),
  maxTokens: z.number().int().positive().optional().nullable(),
  contextWindow: z.number().int().positive().optional().nullable(),
  costPer1kInput: z.string().optional().nullable(),
  costPer1kOutput: z.string().optional().nullable(),
  capabilities: z.record(z.string(), z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { modelId } = await params;

    const body = await request.json();
    const parsed = updateModelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    // Verify model exists and belongs to tenant
    const [existing] = await db
      .select({ id: aiModels.id })
      .from(aiModels)
      .where(
        and(
          eq(aiModels.id, modelId),
          eq(aiModels.tenantId, user.tenantId),
          isNull(aiModels.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Model not found" } },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(aiModels)
      .set(parsed.data)
      .where(eq(aiModels.id, modelId))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/admin/ai-models/[modelId] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "ai:delete"))) {
      return forbiddenResponse();
    }

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const { modelId } = await params;

    // Verify model exists and belongs to tenant
    const [existing] = await db
      .select({ id: aiModels.id })
      .from(aiModels)
      .where(
        and(
          eq(aiModels.id, modelId),
          eq(aiModels.tenantId, user.tenantId),
          isNull(aiModels.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Model not found" } },
        { status: 404 }
      );
    }

    // Soft delete
    const [deleted] = await db
      .update(aiModels)
      .set({ deletedAt: new Date() })
      .where(eq(aiModels.id, modelId))
      .returning();

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("DELETE /api/v1/admin/ai-models/[modelId] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
