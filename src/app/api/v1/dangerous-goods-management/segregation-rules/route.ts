import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { dgmSegregationRules } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listSegregationRules } from "@/lib/dangerous-goods-management/service";
import { createSegregationRuleSchema } from "@/lib/dangerous-goods-management/validation";

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

    const result = await listSegregationRules({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list segregation rules:", error);
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
    const parsed = createSegregationRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const ruleRef = `SGR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db.insert(dgmSegregationRules).values({
      tenantId: user.tenantId,
      ruleRef,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create segregation rule:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
