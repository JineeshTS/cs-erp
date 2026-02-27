import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneSlaInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateSlaInstanceSchema } from "@/lib/workflow-notification-engine/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(wneSlaInstances)
      .where(and(eq(wneSlaInstances.id, id), eq(wneSlaInstances.tenantId, user.tenantId), isNull(wneSlaInstances.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "SLA instance not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("SLA instance get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch SLA instance" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSlaInstanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.completedAt !== undefined) updateData.completedAt = new Date(parsed.data.completedAt);
    if (parsed.data.breachedAt !== undefined) updateData.breachedAt = new Date(parsed.data.breachedAt);
    if (parsed.data.assignedTo !== undefined) updateData.assignedTo = parsed.data.assignedTo;
    if (parsed.data.metadata !== undefined) updateData.metadata = parsed.data.metadata;

    const [updated] = await db.update(wneSlaInstances).set(updateData)
      .where(and(eq(wneSlaInstances.id, id), eq(wneSlaInstances.tenantId, user.tenantId), isNull(wneSlaInstances.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "SLA instance not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("SLA instance update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update SLA instance" } },
      { status: 500 }
    );
  }
}
