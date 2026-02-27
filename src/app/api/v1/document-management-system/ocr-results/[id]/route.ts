import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsOcrResults } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateOcrResultSchema } from "@/lib/document-management-system/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const [record] = await db.select().from(dmsOcrResults)
      .where(and(
        eq(dmsOcrResults.id, id),
        eq(dmsOcrResults.tenantId, user.tenantId),
        isNull(dmsOcrResults.deletedAt)
      )).limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "OCR result not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Get OCR result error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch OCR result" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:edit"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOcrResultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === "completed") {
      updateData.completedAt = new Date();
    }
    if (parsed.data.status === "processing") {
      updateData.startedAt = new Date();
    }

    const [updated] = await db.update(dmsOcrResults).set(updateData)
      .where(and(
        eq(dmsOcrResults.id, id),
        eq(dmsOcrResults.tenantId, user.tenantId),
        isNull(dmsOcrResults.deletedAt)
      )).returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "OCR result not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Update OCR result error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update OCR result" } },
      { status: 500 }
    );
  }
}
