import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiProviders } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

type RouteParams = { params: Promise<{ providerId: string }> };

const updateProviderSchema = z.object({
  providerName: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  apiKeyEncrypted: z.string().optional().nullable(),
  apiEndpoint: z.string().max(500).optional().nullable(),
  isDefault: z.boolean().optional(),
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

    const { providerId } = await params;

    const body = await request.json();
    const parsed = updateProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    // Verify provider exists and belongs to tenant
    const [existing] = await db
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

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Provider not found" } },
        { status: 404 }
      );
    }

    const updates = parsed.data;

    // If setting as default, unset other defaults first
    if (updates.isDefault) {
      await db
        .update(aiProviders)
        .set({ isDefault: false })
        .where(
          and(
            eq(aiProviders.tenantId, user.tenantId),
            eq(aiProviders.isDefault, true),
            isNull(aiProviders.deletedAt)
          )
        );
    }

    const [updated] = await db
      .update(aiProviders)
      .set(updates)
      .where(eq(aiProviders.id, providerId))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/admin/ai-providers/[providerId] error:", error);
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

    const { providerId } = await params;

    // Verify provider exists and belongs to tenant
    const [existing] = await db
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

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Provider not found" } },
        { status: 404 }
      );
    }

    // Soft delete
    const [deleted] = await db
      .update(aiProviders)
      .set({ deletedAt: new Date() })
      .where(eq(aiProviders.id, providerId))
      .returning();

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("DELETE /api/v1/admin/ai-providers/[providerId] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
