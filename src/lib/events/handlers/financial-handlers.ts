/**
 * Event handlers for financial cross-module wiring.
 *
 * INVOICE_GENERATED → notification for AR entry, dunning schedule
 * PAYMENT_RECEIVED → cash application record + notification for AR reconciliation
 * PAYMENT_OVERDUE → collection workflow + notification for dunning escalation
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import {
  wneNotifications,
  arccCashApplications,
  arccCollectionWorkflows,
} from "@/db/schema";

eventBus.on("INVOICE_GENERATED", async (event) => {
  try {
    console.log(`[FinancialHandler] INVOICE: ${event.data.invoiceNumber} — ${event.data.currency} ${event.data.amount}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Invoice Generated: ${event.data.invoiceNumber}`,
      body: `Invoice for ${event.data.currency} ${event.data.amount.toLocaleString()} generated. Due: ${event.data.dueDate}. AR entry created, dunning schedule set.`,
      entityType: "invoice",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[FinancialHandler] Failed to handle INVOICE_GENERATED:", err);
  }
});

eventBus.on("PAYMENT_RECEIVED", async (event) => {
  try {
    console.log(`[FinancialHandler] PAYMENT: ${event.data.currency} ${event.data.amount} for invoice ${event.data.invoiceId}`);

    // 1. Create cash application record for AR reconciliation
    await db.insert(arccCashApplications).values({
      tenantId: event.tenantId,
      applicationRef: `CA-${Date.now()}-${event.entityId.slice(0, 8)}`,
      customerName: event.data.customerId,
      paymentReference: event.data.paymentId,
      paymentMethod: "bank_transfer",
      paymentDate: event.timestamp,
      currency: event.data.currency,
      paymentAmount: event.data.amount,
      appliedAmount: event.data.amount,
      unappliedAmount: 0,
      autoMatched: true,
      matchConfidence: 100,
      status: "applied",
      allocations: [{ invoiceId: event.data.invoiceId, amount: event.data.amount }],
    });

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Payment Received: ${event.data.currency} ${event.data.amount.toLocaleString()}`,
      body: `Payment applied against invoice. Cash application record created. AR balance updated.`,
      entityType: "payment",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[FinancialHandler] Failed to handle PAYMENT_RECEIVED:", err);
  }
});

eventBus.on("PAYMENT_OVERDUE", async (event) => {
  try {
    console.log(`[FinancialHandler] OVERDUE: invoice ${event.data.invoiceId} — ${event.data.daysPastDue} days past due`);

    const priority = event.data.daysPastDue > 60 ? "urgent" : event.data.daysPastDue > 30 ? "high" : "normal";

    // Determine escalation level based on days past due
    const escalationLevel = event.data.daysPastDue > 90 ? 4
      : event.data.daysPastDue > 60 ? 3
      : event.data.daysPastDue > 30 ? 2
      : 1;

    const escalationType = escalationLevel >= 3 ? "legal_notice" : escalationLevel >= 2 ? "dunning_call" : "reminder_email";

    // Calculate next action date (7 days from now for follow-up)
    const nextActionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Create collection workflow for AR team
    await db.insert(arccCollectionWorkflows).values({
      tenantId: event.tenantId,
      workflowRef: `COL-${Date.now()}-${event.entityId.slice(0, 8)}`,
      customerName: event.data.customerId,
      totalOutstanding: event.data.amount,
      totalOverdue: event.data.amount,
      oldestOverdueDays: event.data.daysPastDue,
      invoiceCount: 1,
      escalationLevel,
      escalationType,
      nextActionDate,
      nextActionType: escalationType,
      status: "open",
    });

    // 2. Notification
    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Payment Overdue: ${event.data.daysPastDue} days`,
      body: `Invoice ${event.data.amount.toLocaleString()} is ${event.data.daysPastDue} days overdue. Collection workflow created (level ${escalationLevel}). Credit limit review recommended.`,
      entityType: "invoice",
      entityId: event.entityId,
      priority,
      status: "pending",
    });
  } catch (err) {
    console.error("[FinancialHandler] Failed to handle PAYMENT_OVERDUE:", err);
  }
});
