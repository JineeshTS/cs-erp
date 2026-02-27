import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

type RouteParams = { params: Promise<{ tenantId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const { tenantId } = await params;
  if (user.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(user.id, user.tenantId, "tenants:read"))) {
    return forbiddenResponse();
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tenant not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: tenant });
}

const updateTenantSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().length(3).optional(),
  country: z.string().length(2).optional(),
  logoUrl: z.string().url().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const { tenantId } = await params;
  if (user.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(user.id, user.tenantId, "tenants:edit"))) {
    return forbiddenResponse();
  }

  const body = await request.json();
  const parsed = updateTenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  // If settings.onboarded is set, also stamp onboardedAt
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (
    parsed.data.settings &&
    typeof parsed.data.settings === "object" &&
    "onboarded" in parsed.data.settings
  ) {
    updateData.onboardedAt = new Date();
  }

  const [updated] = await db
    .update(tenants)
    .set(updateData)
    .where(eq(tenants.id, tenantId))
    .returning();

  return NextResponse.json({ data: updated });
}
