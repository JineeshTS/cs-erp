import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneRoutingRules } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRoutingRuleSchema } from "@/lib/workflow-notification-engine/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(wneRoutingRules)
      .where(and(eq(wneRoutingRules.id, id), eq(wneRoutingRules.tenantId, user.tenantId), isNull(wneRoutingRules.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Routing rule not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("GET /routing-rules/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch routing rule" } },
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
    const parsed = updateRoutingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(wneRoutingRules).set(parsed.data)
      .where(and(eq(wneRoutingRules.id, id), eq(wneRoutingRules.tenantId, user.tenantId), isNull(wneRoutingRules.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Routing rule not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /routing-rules/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update routing rule" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(wneRoutingRules).set({ deletedAt: new Date() })
      .where(and(eq(wneRoutingRules.id, id), eq(wneRoutingRules.tenantId, user.tenantId), isNull(wneRoutingRules.deletedAt))).returning({ id: wneRoutingRules.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Routing rule not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("DELETE /routing-rules/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete routing rule" } },
      { status: 500 }
    );
  }
}
