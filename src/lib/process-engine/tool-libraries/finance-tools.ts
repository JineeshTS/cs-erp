/**
 * Finance Tool Library (D-006 Phase 4)
 *
 * 4 tool implementations for E2E-04 Booking-to-Cash (steps 22-25).
 * Covers: freight invoicing, tax calculation, cash application,
 * revenue recognition.
 *
 * Real DB operations on: firm_freight_invoices, firm_invoice_line_items,
 * arcc_cash_applications, cfm_revenue_recognitions
 */

import { db } from "@/lib/db";
import {
  firmFreightInvoices,
  firmInvoiceLineItems,
  arccCashApplications,
  cfmRevenueRecognitions,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  createEntityBinding,
  resolveEntityInFlow,
} from "../entity-binding-service";
import type { ToolCallContext, ToolCallResult } from "./types";

// ═══════════════════════════════════════════════════════════
// STEP 22: FREIGHT INVOICE GENERATION
// ═══════════════════════════════════════════════════════════

export async function executeGenerateFreightInvoice(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const customerName = (input.customerName as string) ?? "";
  const bookingRef = (input.bookingReference as string) ?? "";
  const blNumber = (input.blNumber as string) ?? "";
  const voyageRef = (input.voyageReference as string) ?? "";
  const currency = (input.currency as string) ?? "USD";
  const lineItems = (input.lineItems as Array<Record<string, unknown>>) ?? [];
  const dueInDays = (input.dueInDays as number) ?? 30;

  // Calculate totals
  let subtotal = 0;
  for (const item of lineItems) {
    subtotal += ((item.unitPrice as number) ?? 0) * ((item.quantity as number) ?? 1);
  }
  const taxRate = (input.taxRate as number) ?? 0;
  const taxAmount = Math.round(subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueInDays);

  const [invoice] = await db
    .insert(firmFreightInvoices)
    .values({
      tenantId,
      invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
      invoiceType: "freight",
      voyageRef,
      bookingRef,
      blNumber,
      customerName,
      currency,
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      dueDate,
      status: "draft",
      metadata: {
        generatedBy: "ai_invoice_agent",
        generatedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Create line items
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    const qty = (item.quantity as number) ?? 1;
    const unitPrice = (item.unitPrice as number) ?? 0;
    const amount = qty * unitPrice;

    await db.insert(firmInvoiceLineItems).values({
      tenantId,
      invoiceId: invoice.id,
      lineNumber: i + 1,
      chargeCode: (item.chargeCode as string) ?? `CHG-${i + 1}`,
      description: (item.description as string) ?? "",
      quantity: qty,
      unitPrice,
      amount,
      taxRate: taxRate,
      taxAmount: Math.round(amount * taxRate) / 100,
      totalAmount: amount + Math.round(amount * taxRate) / 100,
      metadata: {},
    });
  }

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "firm_freight_invoices",
    entityId: invoice.id,
    entityAction: "create",
    entityData: invoice as unknown as Record<string, unknown>,
  });

  return {
    result: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName,
      subtotal,
      taxAmount,
      totalAmount,
      dueDate: dueDate.toISOString(),
      lineItemCount: lineItems.length,
      status: "draft",
    },
    entityTable: "firm_freight_invoices",
    entityId: invoice.id,
    entityAction: "create",
    entityData: invoice as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 23: TAX CALCULATION
// ═══════════════════════════════════════════════════════════

export async function executeCalculateTax(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const invoiceBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "firm_freight_invoices"
  );
  const invoiceId = (input.invoiceId as string) || invoiceBinding?.entityId;

  const subtotal = (input.subtotal as number) ?? 0;
  const taxJurisdiction = (input.taxJurisdiction as string) ?? "AE";
  const taxType = (input.taxType as string) ?? "VAT";

  // ERP-107: Read tax rate from DB (falls back to defaults if not configured)
  const { calculateTax } = await import("@/lib/engines/tax");
  const { ratePercent, taxAmount, totalWithTax } = await calculateTax(tenantId, subtotal, taxJurisdiction, taxType);

  // Update invoice if linked
  if (invoiceId) {
    await db
      .update(firmFreightInvoices)
      .set({
        taxAmount,
        totalAmount: totalWithTax,
        outstandingAmount: totalWithTax,
        metadata: sql`COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({
          taxCalculation: {
            taxJurisdiction,
            taxType,
            ratePercent,
            taxAmount,
            calculatedBy: "ai_tax_calculator",
            calculatedAt: new Date().toISOString(),
          },
        })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(firmFreightInvoices.id, invoiceId),
          eq(firmFreightInvoices.tenantId, tenantId)
        )
      );
  }

  return {
    result: {
      invoiceId,
      subtotal,
      taxJurisdiction,
      taxType,
      ratePercent,
      taxAmount,
      totalWithTax,
    },
    entityTable: invoiceId ? "firm_freight_invoices" : undefined,
    entityId: invoiceId ?? undefined,
    entityAction: invoiceId ? "update" : undefined,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 24: CASH APPLICATION
// ═══════════════════════════════════════════════════════════

export async function executeApplyCash(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const paymentReference = (input.paymentReference as string) ?? "";
  const paymentAmount = (input.paymentAmount as number) ?? 0;
  const paymentMethod = (input.paymentMethod as string) ?? "wire_transfer";
  const paymentDate = (input.paymentDate as string) ?? new Date().toISOString();
  const customerName = (input.customerName as string) ?? "";

  const invoiceBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "firm_freight_invoices"
  );
  const invoiceId = (input.invoiceId as string) || invoiceBinding?.entityId;

  const [cashApp] = await db
    .insert(arccCashApplications)
    .values({
      tenantId,
      applicationRef: `CA-${Date.now().toString(36).toUpperCase()}`,
      paymentReference,
      paymentAmount,
      appliedAmount: paymentAmount,
      unappliedAmount: 0,
      paymentMethod,
      paymentDate: new Date(paymentDate),
      customerName,
      autoMatched: true,
      status: "applied",
      metadata: {
        invoiceId,
        appliedBy: "ai_cash_applicator",
        appliedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Update invoice paid amount if linked
  if (invoiceId) {
    const invoiceData = invoiceBinding?.entityData as Record<string, unknown> | null;
    const previousPaid = (invoiceData?.paidAmount as number) ?? 0;
    const totalAmount = (invoiceData?.totalAmount as number) ?? paymentAmount;
    const newPaid = previousPaid + paymentAmount;
    const outstanding = Math.max(0, totalAmount - newPaid);

    await db
      .update(firmFreightInvoices)
      .set({
        paidAmount: newPaid,
        outstandingAmount: outstanding,
        status: outstanding <= 0 ? "paid" : "partially_paid",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(firmFreightInvoices.id, invoiceId),
          eq(firmFreightInvoices.tenantId, tenantId)
        )
      );
  }

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "arcc_cash_applications",
    entityId: cashApp.id,
    entityAction: "create",
    entityData: cashApp as unknown as Record<string, unknown>,
  });

  return {
    result: {
      cashApplicationId: cashApp.id,
      applicationRef: cashApp.applicationRef,
      paymentReference,
      paymentAmount,
      appliedAmount: paymentAmount,
      paymentMethod,
      invoiceId,
      status: "applied",
    },
    entityTable: "arcc_cash_applications",
    entityId: cashApp.id,
    entityAction: "create",
    entityData: cashApp as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 25: REVENUE RECOGNITION
// ═══════════════════════════════════════════════════════════

export async function executeRecognizeRevenue(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const voyageRef = (input.voyageReference as string) ?? "";
  const grossRevenue = (input.grossRevenue as number) ?? 0;
  const deductions = (input.deductions as number) ?? 0;
  const netRevenue = grossRevenue - deductions;
  const completionPercent = (input.completionPercent as number) ?? 100;
  const recognizedAmount = Math.round((netRevenue * completionPercent) / 100);
  const deferredAmount = netRevenue - recognizedAmount;
  const accountingPeriod = (input.accountingPeriod as string) ??
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const recognitionMethod = (input.recognitionMethod as string) ?? "IFRS15";

  const invoiceBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "firm_freight_invoices"
  );

  const [recognition] = await db
    .insert(cfmRevenueRecognitions)
    .values({
      tenantId,
      recognitionRef: `RR-${Date.now().toString(36).toUpperCase()}`,
      voyageRef,
      revenueType: "freight",
      recognitionMethod,
      recognitionPeriod: accountingPeriod,
      grossRevenue,
      deductions,
      netRevenue,
      recognizedAmount,
      deferredAmount,
      completionPercent,
      status: "recognized",
      metadata: {
        invoiceId: invoiceBinding?.entityId,
        recognizedBy: "ai_revenue_agent",
        recognizedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "cfm_revenue_recognitions",
    entityId: recognition.id,
    entityAction: "create",
    entityData: recognition as unknown as Record<string, unknown>,
  });

  return {
    result: {
      recognitionId: recognition.id,
      recognitionRef: recognition.recognitionRef,
      voyageRef,
      grossRevenue,
      netRevenue,
      recognizedAmount,
      deferredAmount,
      completionPercent,
      accountingPeriod,
      recognitionMethod,
      status: "recognized",
    },
    entityTable: "cfm_revenue_recognitions",
    entityId: recognition.id,
    entityAction: "create",
    entityData: recognition as unknown as Record<string, unknown>,
  };
}
