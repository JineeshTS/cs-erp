import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { simHireSurveys } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateHireSurveySchema } from "@/lib/survey-inspection-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(simHireSurveys).where(and(eq(simHireSurveys.id, id), eq(simHireSurveys.tenantId, user.tenantId), isNull(simHireSurveys.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Hire survey not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get hire survey:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateHireSurveySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const [updated] = await db.update(simHireSurveys).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(simHireSurveys.id, id), eq(simHireSurveys.tenantId, user.tenantId), isNull(simHireSurveys.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Hire survey not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update hire survey:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(simHireSurveys).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(simHireSurveys.id, id), eq(simHireSurveys.tenantId, user.tenantId), isNull(simHireSurveys.deletedAt))).returning({ id: simHireSurveys.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Hire survey not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete hire survey:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
