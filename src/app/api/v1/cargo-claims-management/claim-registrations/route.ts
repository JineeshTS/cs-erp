import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ccmClaimRegistrations } from "@/db/schema";
import { listClaimRegistrations } from "@/lib/cargo-claims-management/service";
import { createClaimRegistrationSchema } from "@/lib/cargo-claims-management/validation";
import { eventBus } from "@/lib/events/event-bus";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ccm:read")))
      return forbiddenResponse();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 50);
    const result = await listClaimRegistrations({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list claim registrations:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ccm:create")))
      return forbiddenResponse();
    const body = await request.json();
    const parsed = createClaimRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }
    const claimRef = `CCR-${Date.now()}`;
    const [record] = await db
      .insert(ccmClaimRegistrations)
      .values({
        ...parsed.data,
        claimRef,
        tenantId: user.tenantId,
        status: "draft",
      })
      .returning();

    eventBus.emit({
      type: "CARGO_CLAIM_FILED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: record.id,
      entityType: "cargo_claim",
      timestamp: new Date(),
      data: {
        claimId: record.id,
        bookingId: parsed.data.blNumber ?? "",
        claimType: parsed.data.claimType,
        estimatedValue: Number(parsed.data.claimAmountUsd ?? 0),
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create claim registration:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
