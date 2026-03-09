import { NextRequest, NextResponse } from "next/server";
import { and, lt, gt, isNull, ne, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { firmFreightInvoices } from "@/db/schema";
import { eventBus } from "@/lib/events/event-bus";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/overdue-invoices
 *
 * Scans for invoices past their due date that are not yet fully paid.
 * Emits PAYMENT_OVERDUE events for each. Designed to be called by
 * an external cron job (e.g. every hour).
 *
 * Auth: INTERNAL_API_KEY header check — not user-facing.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-api-key");
    if (!INTERNAL_API_KEY || apiKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid internal API key" } },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find invoices where dueDate is in the past, outstanding > 0, not deleted,
    // and status is not already "overdue" (avoid re-emitting every cron cycle)
    const overdueInvoices = await db
      .select({
        id: firmFreightInvoices.id,
        tenantId: firmFreightInvoices.tenantId,
        invoiceNumber: firmFreightInvoices.invoiceNumber,
        customerName: firmFreightInvoices.customerName,
        outstandingAmount: firmFreightInvoices.outstandingAmount,
        currency: firmFreightInvoices.currency,
        dueDate: firmFreightInvoices.dueDate,
      })
      .from(firmFreightInvoices)
      .where(
        and(
          lt(firmFreightInvoices.dueDate, now),
          gt(firmFreightInvoices.outstandingAmount, 0),
          isNull(firmFreightInvoices.deletedAt),
          ne(firmFreightInvoices.status, "overdue"),
          ne(firmFreightInvoices.status, "cancelled"),
          ne(firmFreightInvoices.status, "void")
        )
      );

    const emittedIds: string[] = [];

    for (const invoice of overdueInvoices) {
      if (!invoice.dueDate) continue;

      const daysPastDue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      eventBus.emit({
        type: "PAYMENT_OVERDUE",
        tenantId: invoice.tenantId,
        userId: "system",
        entityId: invoice.id,
        entityType: "invoice",
        timestamp: now,
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerName,
          amount: invoice.outstandingAmount,
          daysPastDue,
        },
      });

      emittedIds.push(invoice.id);
    }

    // Bulk update: mark all emitted invoices as overdue in one query
    if (emittedIds.length > 0) {
      await db
        .update(firmFreightInvoices)
        .set({ status: "overdue" })
        .where(inArray(firmFreightInvoices.id, emittedIds));
    }

    return NextResponse.json({
      data: {
        scannedAt: now.toISOString(),
        overdueFound: overdueInvoices.length,
        eventsEmitted: emittedIds.length,
      },
    });
  } catch (error) {
    console.error("Overdue invoice cron error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process overdue invoices" } },
      { status: 500 }
    );
  }
}
