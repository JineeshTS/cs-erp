import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { locCargoCutoffs } from "@/db/schema";
import { getCargoCutoff } from "@/lib/liner-operations-control/service";
import { updateCargoCutoffSchema } from "@/lib/liner-operations-control/validation";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "loc:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getCargoCutoff(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cargo cutoff not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get cargo cutoff:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "loc:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCargoCutoffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(locCargoCutoffs)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(locCargoCutoffs.id, id), eq(locCargoCutoffs.tenantId, user.tenantId)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cargo cutoff not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update cargo cutoff:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "loc:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .update(locCargoCutoffs)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(locCargoCutoffs.id, id), eq(locCargoCutoffs.tenantId, user.tenantId)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cargo cutoff not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete cargo cutoff:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
