import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isfK8sClusters } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listClusters } from "@/lib/infrastructure-security/service";
import { createClusterSchema } from "@/lib/infrastructure-security/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const search = request.nextUrl.searchParams.get("search") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const result = await listClusters({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list clusters:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "infra:create")))
      return forbiddenResponse();

    const body = await request.json();
    const parsed = createClusterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(isfK8sClusters).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cluster:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
