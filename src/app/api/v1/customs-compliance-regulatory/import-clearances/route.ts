import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { ccrImportClearances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createImportClearanceSchema } from "@/lib/customs-compliance-regulatory/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";
import { eventBus } from "@/lib/events/event-bus";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(ccrImportClearances.tenantId, user.tenantId),
      isNull(ccrImportClearances.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(ccrImportClearances.clearanceRef, `%${search}%`),
          ilike(ccrImportClearances.importerName, `%${search}%`),
          ilike(ccrImportClearances.blNumber, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(ccrImportClearances.status, status));
    }

    if (cursor) {
      conditions.push(gt(ccrImportClearances.createdAt, new Date(cursor)));
    }

    const results = await db
      .select()
      .from(ccrImportClearances)
      .where(and(...conditions))
      .orderBy(desc(ccrImportClearances.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list import clearances:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "customs:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createImportClearanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const clearanceRef = `CIC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(ccrImportClearances)
      .values({
        ...parsed.data,
        clearanceRef,
        tenantId: user.tenantId,
      })
      .returning();

    // Emit CUSTOMS_HELD if inspection required or status indicates hold; otherwise CUSTOMS_CLEARED
    if (created.inspectionRequired || created.status === "held" || created.status === "inspection") {
      eventBus.emit({
        type: "CUSTOMS_HELD",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "customs_filing",
        timestamp: new Date(),
        data: {
          filingId: created.id,
          bookingId: parsed.data.consignmentRef ?? "",
          holdReason: created.inspectionRequired ? "Inspection required" : "Customs hold",
        },
      });
    } else {
      eventBus.emit({
        type: "CUSTOMS_CLEARED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "customs_filing",
        timestamp: new Date(),
        data: {
          filingId: created.id,
          bookingId: parsed.data.consignmentRef ?? "",
          customsAuthority: parsed.data.customsOffice ?? "",
          clearanceNumber: clearanceRef,
        },
      });
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create import clearance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
