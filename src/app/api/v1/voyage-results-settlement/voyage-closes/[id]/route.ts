import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getVoyageClose } from "@/lib/voyage-results-settlement/service";
import { updateVoyageCloseSchema } from "@/lib/voyage-results-settlement/validation";
import { db } from "@/lib/db";
import { vrsVoyageCloses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getVoyageClose(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Voyage close not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get voyage close:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getVoyageClose(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Voyage close not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateVoyageCloseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(vrsVoyageCloses)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(vrsVoyageCloses.id, id), eq(vrsVoyageCloses.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update voyage close:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getVoyageClose(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Voyage close not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(vrsVoyageCloses)
      .set({ deletedAt: new Date() })
      .where(and(eq(vrsVoyageCloses.id, id), eq(vrsVoyageCloses.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete voyage close:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
