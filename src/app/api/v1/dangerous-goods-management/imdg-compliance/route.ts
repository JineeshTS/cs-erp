import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { dgmImdgCompliance } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listImdgCompliance } from "@/lib/dangerous-goods-management/service";
import { createImdgComplianceSchema } from "@/lib/dangerous-goods-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listImdgCompliance({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list IMDG compliance records:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createImdgComplianceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const complianceRef = `IMD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db.insert(dgmImdgCompliance).values({
      tenantId: user.tenantId,
      complianceRef,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create IMDG compliance record:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
