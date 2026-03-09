import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { arccCashApplications } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listCashApplications } from "@/lib/accounts-receivable-credit-control/service";
import { createCashApplicationSchema } from "@/lib/accounts-receivable-credit-control/validation";
import { eventBus } from "@/lib/events/event-bus";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "receivable:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listCashApplications({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list cash applications:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "receivable:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createCashApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const applicationRef = `CA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db.insert(arccCashApplications).values({
      tenantId: user.tenantId,
      applicationRef,
      ...parsed.data,
      unappliedAmount: parsed.data.paymentAmount,
    }).returning();

    eventBus.emit({
      type: "PAYMENT_RECEIVED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "payment",
      timestamp: new Date(),
      data: {
        paymentId: created.id,
        invoiceId: parsed.data.accountId ?? "",
        customerId: parsed.data.customerName ?? "",
        amount: parsed.data.paymentAmount,
        currency: parsed.data.currency ?? "USD",
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cash application:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
