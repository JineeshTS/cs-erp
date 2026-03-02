import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dgmChemicalSafetyData } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listChemicalSafetyData } from "@/lib/dangerous-goods-management/service";
import { createChemicalSafetyDataSchema } from "@/lib/dangerous-goods-management/validation";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;

    const result = await listChemicalSafetyData({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list chemical safety data:", error);
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
    const parsed = createChemicalSafetyDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const safetyDataRef = `CSD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(dgmChemicalSafetyData).values({
      tenantId: user.tenantId,
      safetyDataRef,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create chemical safety data:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
