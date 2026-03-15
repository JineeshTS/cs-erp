import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listAntiFoulings } from "@/lib/marpol-environmental-compliance/service";
import { createAntiFoulingSchema } from "@/lib/marpol-environmental-compliance/validation";
import { db } from "@/lib/db";
import { mecAntiFoulings } from "@/db/schema";
import { nanoid } from "nanoid";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:read"))) return forbiddenResponse();
    const { searchParams } = new URL(request.url);
    const result = await listAntiFoulings({
      tenantId: user.tenantId,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list anti foulings:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:create"))) return forbiddenResponse();
    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const body = await request.json();
    const parsed = createAntiFoulingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [record] = await db.insert(mecAntiFoulings).values({ tenantId: user.tenantId, afsRef: `AF-${nanoid(12)}`, ...parsed.data, status: "draft" }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "anti-foulings", entityId: record?.id, module: "marpol-environmental-compliance", newData: record as Record<string, unknown>, request });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create anti fouling:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
