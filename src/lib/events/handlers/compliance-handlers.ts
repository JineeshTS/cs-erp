/**
 * Event handlers for customs/compliance cross-module wiring.
 *
 * CUSTOMS_CLEARED → triggers delivery authorization, cargo release
 * CUSTOMS_HELD → triggers hold notification, compliance review
 * CARGO_CLAIM_FILED → triggers claims processing, insurance notification
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("CUSTOMS_CLEARED", async (event) => {
  console.log(`[ComplianceHandler] CUSTOMS_CLEARED: filing ${event.data.filingId}, clearance: ${event.data.clearanceNumber}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Customs Cleared: ${event.data.clearanceNumber}`,
    body: `Customs clearance received from ${event.data.customsAuthority}. Delivery authorization and cargo release order can proceed.`,
    entityType: "customs_filing",
    entityId: event.entityId,
    priority: "high",
    status: "pending",
  });
});

eventBus.on("CUSTOMS_HELD", async (event) => {
  console.log(`[ComplianceHandler] CUSTOMS_HELD: filing ${event.data.filingId} — reason: ${event.data.holdReason}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Customs Hold Alert`,
    body: `Customs hold placed. Reason: ${event.data.holdReason}. Compliance review and document submission required to resolve.`,
    entityType: "customs_filing",
    entityId: event.entityId,
    priority: "urgent",
    status: "pending",
  });
});

eventBus.on("CARGO_CLAIM_FILED", async (event) => {
  console.log(`[ComplianceHandler] CARGO_CLAIM: ${event.data.claimId} — ${event.data.claimType}, est: $${event.data.estimatedValue}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Cargo Claim Filed: ${event.data.claimType}`,
    body: `Cargo claim filed with estimated value $${event.data.estimatedValue.toLocaleString()}. Claims processing, liability assessment, and P&I insurance notification initiated.`,
    entityType: "cargo_claim",
    entityId: event.entityId,
    priority: "high",
    status: "pending",
  });
});

eventBus.on("CARGO_RELEASED", async (event) => {
  console.log(`[ComplianceHandler] CARGO_RELEASED: DO ${event.data.deliveryOrderId}, containers: ${event.data.containerNumbers.length}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Cargo Released: ${event.data.containerNumbers.length} containers`,
    body: `Delivery order issued. ${event.data.containerNumbers.join(", ")} authorized for release. Consignee notified.`,
    entityType: "delivery_order",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});
