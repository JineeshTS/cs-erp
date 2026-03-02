import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { vtmPredictiveMaintenance } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listPredictiveMaintenance } from "@/lib/vessel-technical-management/service";
import { createPredictiveMaintenanceSchema } from "@/lib/vessel-technical-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:read"))) return forbiddenResponse();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const result = await listPredictiveMaintenance({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list predictive maintenance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:create"))) return forbiddenResponse();
    const body = await request.json();
    const parsed = createPredictiveMaintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }
    const predictionRef = `APM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(vtmPredictiveMaintenance).values({ tenantId: user.tenantId, predictionRef, ...parsed.data }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create predictive maintenance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
