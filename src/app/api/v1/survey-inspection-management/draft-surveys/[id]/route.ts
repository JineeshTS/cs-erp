import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { simDraftSurveys } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDraftSurveySchema } from "@/lib/survey-inspection-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(simDraftSurveys)
      .where(
        and(
          eq(simDraftSurveys.id, id),
          eq(simDraftSurveys.tenantId, user.tenantId),
          isNull(simDraftSurveys.deletedAt)
        )
      );

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Draft survey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get draft survey:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDraftSurveySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(simDraftSurveys)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(simDraftSurveys.id, id),
          eq(simDraftSurveys.tenantId, user.tenantId),
          isNull(simDraftSurveys.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "draft-surveys", entityId: updated?.id, module: "survey-inspection-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Draft survey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update draft survey:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "survey:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db
      .update(simDraftSurveys)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(simDraftSurveys.id, id),
          eq(simDraftSurveys.tenantId, user.tenantId),
          isNull(simDraftSurveys.deletedAt)
        )
      )
      .returning({ id: simDraftSurveys.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "draft-surveys", entityId: deleted?.id, module: "survey-inspection-management", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Draft survey not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete draft survey:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
