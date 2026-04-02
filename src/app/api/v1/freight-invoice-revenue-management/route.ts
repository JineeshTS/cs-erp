import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  firmFreightInvoices,
  firmDebitCreditNotes,
  firmInvoiceDisputes,
  firmDunningRuns,
  firmRevenueForecastEntries,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "invoice:read")))
      return forbiddenResponse();

    const [
      draftInvoices,
      pendingNotes,
      openDisputes,
      activeDunning,
      draftForecasts,
    ] = await Promise.all([
      db.select({ value: count() }).from(firmFreightInvoices)
        .where(and(eq(firmFreightInvoices.tenantId, user.tenantId), isNull(firmFreightInvoices.deletedAt), eq(firmFreightInvoices.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(firmDebitCreditNotes)
        .where(and(eq(firmDebitCreditNotes.tenantId, user.tenantId), isNull(firmDebitCreditNotes.deletedAt), eq(firmDebitCreditNotes.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(firmInvoiceDisputes)
        .where(and(eq(firmInvoiceDisputes.tenantId, user.tenantId), isNull(firmInvoiceDisputes.deletedAt), eq(firmInvoiceDisputes.status, "open")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(firmDunningRuns)
        .where(and(eq(firmDunningRuns.tenantId, user.tenantId), isNull(firmDunningRuns.deletedAt), eq(firmDunningRuns.status, "running")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(firmRevenueForecastEntries)
        .where(and(eq(firmRevenueForecastEntries.tenantId, user.tenantId), isNull(firmRevenueForecastEntries.deletedAt), eq(firmRevenueForecastEntries.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        draftInvoices,
        pendingNotes,
        openDisputes,
        activeDunning,
        draftForecasts,
      },
    });
  } catch (error) {
    console.error("Failed to get freight invoice hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
