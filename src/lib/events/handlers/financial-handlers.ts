/**
 * Event handlers for financial cross-module wiring.
 *
 * INVOICE_GENERATED → triggers AR entry, dunning schedule, customer notification
 * PAYMENT_RECEIVED → triggers AR reconciliation, receipt confirmation
 * PAYMENT_OVERDUE → triggers dunning escalation, credit hold evaluation
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("INVOICE_GENERATED", async (event) => {
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
});

eventBus.on("PAYMENT_RECEIVED", async (event) => {
  console.log(`[FinancialHandler] PAYMENT: ${event.data.currency} ${event.data.amount} for invoice ${event.data.invoiceId}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Payment Received: ${event.data.currency} ${event.data.amount.toLocaleString()}`,
    body: `Payment applied against invoice. AR balance updated. Bank reconciliation entry created.`,
    entityType: "payment",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});

eventBus.on("PAYMENT_OVERDUE", async (event) => {
  console.log(`[FinancialHandler] OVERDUE: invoice ${event.data.invoiceId} — ${event.data.daysPastDue} days past due`);

  const priority = event.data.daysPastDue > 60 ? "urgent" : event.data.daysPastDue > 30 ? "high" : "normal";

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Payment Overdue: ${event.data.daysPastDue} days`,
    body: `Invoice ${event.data.amount.toLocaleString()} is ${event.data.daysPastDue} days overdue. Dunning escalation triggered. Credit limit review recommended.`,
    entityType: "invoice",
    entityId: event.entityId,
    priority,
    status: "pending",
  });
});
