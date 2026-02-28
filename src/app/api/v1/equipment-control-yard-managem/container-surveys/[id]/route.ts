import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyContainerSurveys } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateContainerSurveySchema } from "@/lib/equipment-control-yard-managem/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(eqyContainerSurveys)
      .where(
        and(
          eq(eqyContainerSurveys.id, id),
          eq(eqyContainerSurveys.tenantId, user.tenantId),
          isNull(eqyContainerSurveys.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Container survey not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to fetch container survey:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateContainerSurveySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { surveyDate, nextSurveyDue, ...rest } = parsed.data;

    const [updated] = await db
      .update(eqyContainerSurveys)
      .set({
        ...rest,
        ...(surveyDate !== undefined && { surveyDate: new Date(surveyDate) }),
        ...(nextSurveyDue !== undefined && { nextSurveyDue: nextSurveyDue ? new Date(nextSurveyDue) : null }),
      })
      .where(
        and(
          eq(eqyContainerSurveys.id, id),
          eq(eqyContainerSurveys.tenantId, user.tenantId),
          isNull(eqyContainerSurveys.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Container survey not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update container survey:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(eqyContainerSurveys)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(eqyContainerSurveys.id, id),
          eq(eqyContainerSurveys.tenantId, user.tenantId),
          isNull(eqyContainerSurveys.deletedAt)
        )
      )
      .returning({ id: eqyContainerSurveys.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Container survey not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete container survey:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
