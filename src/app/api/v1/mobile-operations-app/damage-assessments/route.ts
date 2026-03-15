import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listDamageAssessments } from "@/lib/mobile-operations-app/service";
import { createDamageAssessmentSchema } from "@/lib/mobile-operations-app/validation";
import { db } from "@/lib/db";
import { mobDamageAssessments } from "@/db/schema";
import { nanoid } from "nanoid";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mob:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const result = await listDamageAssessments({
      tenantId: user.tenantId,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list damage assessments:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "mob:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const body = await request.json();
    const parsed = createDamageAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const assessmentRef = `DMA-${nanoid(12)}`;
    const [record] = await db
      .insert(mobDamageAssessments)
      .values({
        tenantId: user.tenantId,
        assessmentRef,
        ...parsed.data,
        status: "draft",
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "damage-assessments", entityId: record?.id, module: "mobile-operations-app", newData: record as Record<string, unknown>, request });

    eventBus.emit({
      type: "CONTAINER_DAMAGED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: record.id,
      entityType: "container",
      timestamp: new Date(),
      data: {
        containerNumber: parsed.data.containerNumber ?? "",
        damageType: parsed.data.damageCategory ?? parsed.data.aiDetectedType ?? "unspecified",
        severity: (parsed.data.severityLevel === "severe" ? "severe" : parsed.data.severityLevel === "moderate" ? "moderate" : "minor") as "minor" | "moderate" | "severe",
        estimatedRepairCost: parsed.data.estimatedRepairCost ? Number(parsed.data.estimatedRepairCost) : undefined,
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create damage assessment:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
