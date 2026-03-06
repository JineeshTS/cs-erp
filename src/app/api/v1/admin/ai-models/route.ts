import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiModels, aiProviders } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const models = await db
      .select({
        id: aiModels.id,
        tenantId: aiModels.tenantId,
        providerId: aiModels.providerId,
        modelId: aiModels.modelId,
        displayName: aiModels.displayName,
        modelType: aiModels.modelType,
        maxTokens: aiModels.maxTokens,
        contextWindow: aiModels.contextWindow,
        costPer1kInput: aiModels.costPer1kInput,
        costPer1kOutput: aiModels.costPer1kOutput,
        isActive: aiModels.isActive,
        capabilities: aiModels.capabilities,
        metadata: aiModels.metadata,
        createdAt: aiModels.createdAt,
        updatedAt: aiModels.updatedAt,
        providerName: aiProviders.displayName,
      })
      .from(aiModels)
      .innerJoin(aiProviders, eq(aiModels.providerId, aiProviders.id))
      .where(
        and(
          eq(aiModels.tenantId, user.tenantId),
          isNull(aiModels.deletedAt)
        )
      );

    return NextResponse.json({ data: models, meta: { total: models.length } });
  } catch (error) {
    console.error("GET /api/v1/admin/ai-models error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

const createModelSchema = z.object({
  providerId: z.string().uuid(),
  modelId: z.string().min(1).max(100),
  displayName: z.string().min(1).max(150),
  modelType: z.string().min(1).max(30),
  maxTokens: z.number().int().positive().optional(),
  contextWindow: z.number().int().positive().optional(),
  costPer1kInput: z.string().optional(),
  costPer1kOutput: z.string().optional(),
  capabilities: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "ai:create"))) {
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
    const parsed = createModelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { providerId, modelId, displayName, modelType, maxTokens, contextWindow, costPer1kInput, costPer1kOutput, capabilities } = parsed.data;

    // Verify provider exists and belongs to tenant
    const [provider] = await db
      .select({ id: aiProviders.id })
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.id, providerId),
          eq(aiProviders.tenantId, user.tenantId),
          isNull(aiProviders.deletedAt)
        )
      )
      .limit(1);

    if (!provider) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Provider not found" } },
        { status: 404 }
      );
    }

    const [model] = await db
      .insert(aiModels)
      .values({
        tenantId: user.tenantId,
        providerId,
        modelId,
        displayName,
        modelType,
        maxTokens: maxTokens ?? null,
        contextWindow: contextWindow ?? null,
        costPer1kInput: costPer1kInput ?? null,
        costPer1kOutput: costPer1kOutput ?? null,
        capabilities: capabilities ?? null,
      })
      .returning();

    return NextResponse.json({ data: model }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/ai-models error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
