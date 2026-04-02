/**
 * Transaction Chain Engine
 *
 * Automates: Booking confirmed → Draft BL created → BL released → Draft Invoice created
 * Each step generates proper document numbers and links entities via references.
 */

import { db } from "@/lib/db";
import { odmBillsOfLading } from "@/db/schema";
import { firmFreightInvoices } from "@/db/schema";
import { generateNextNumber } from "@/lib/number-sequence";

/**
 * Auto-generate a draft BL when a booking is confirmed.
 * Called from the booking confirm endpoint.
 */
export async function generateDraftBL(params: {
  tenantId: string;
  bookingId: string;
  bookingRef: string;
  customerName: string;
  consigneeName?: string;
  originPort?: string;
  destinationPort?: string;
  vesselName?: string;
  voyageNumber?: string;
  containerCount?: number;
  userId?: string;
}): Promise<{ blId: string; blNumber: string }> {
  const blNumber = await generateNextNumber("bill_of_lading", params.tenantId);

  const [bl] = await db
    .insert(odmBillsOfLading)
    .values({
      tenantId: params.tenantId,
      blNumber,
      blType: "original",
      blStatus: "draft",
      bookingReference: params.bookingRef,
      shipperName: params.customerName,
      consigneeName: params.consigneeName || "To Order",
      vesselName: params.vesselName || null,
      voyageNumber: params.voyageNumber || null,
      portOfLoading: params.originPort || null,
      portOfDischarge: params.destinationPort || null,
      freightTerms: "prepaid",
      numberOfOriginals: 3,
      containerCount: params.containerCount || null,
      dateOfIssue: new Date().toISOString().slice(0, 10),
    })
    .returning({ id: odmBillsOfLading.id, blNumber: odmBillsOfLading.blNumber });

  return { blId: bl.id, blNumber: bl.blNumber };
}

/**
 * Auto-generate a draft freight invoice when a BL is released.
 * Called from the BL PATCH endpoint on status → released.
 */
export async function generateDraftInvoice(params: {
  tenantId: string;
  blNumber: string;
  bookingRef?: string;
  voyageRef?: string;
  customerName: string;
  currency?: string;
  freightAmount?: number;
  surcharges?: Array<{ code: string; name: string; amount: number }>;
  userId?: string;
}): Promise<{ invoiceId: string; invoiceNumber: string }> {
  const invoiceNumber = await generateNextNumber("invoice", params.tenantId);

  const freightAmount = params.freightAmount || 0;
  const surchargeTotal = (params.surcharges || []).reduce((s, c) => s + c.amount, 0);
  const subtotal = freightAmount + surchargeTotal;
  const taxAmount = 0; // Tax calculated separately via tax engine
  const totalAmount = subtotal + taxAmount;

  const [invoice] = await db
    .insert(firmFreightInvoices)
    .values({
      tenantId: params.tenantId,
      invoiceNumber,
      invoiceType: "freight",
      voyageRef: params.voyageRef || null,
      bookingRef: params.bookingRef || null,
      blNumber: params.blNumber,
      customerName: params.customerName,
      currency: params.currency || "USD",
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      paymentTerms: "Net 30",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
    })
    .returning({ id: firmFreightInvoices.id, invoiceNumber: firmFreightInvoices.invoiceNumber });

  return { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };
}
