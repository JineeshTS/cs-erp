/**
 * Event handlers for customs/compliance cross-module wiring.
 *
 * CUSTOMS_CLEARED → notification for delivery authorization
 * CUSTOMS_HELD → notification for compliance review
 * CARGO_CLAIM_FILED → notification for claims processing
 * CARGO_RELEASED → notification for consignee pickup
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("CUSTOMS_CLEARED", async (event) => {
  try {
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
  } catch (err) {
    console.error("[ComplianceHandler] Failed to handle CUSTOMS_CLEARED:", err);
  }
});

eventBus.on("CUSTOMS_HELD", async (event) => {
  try {
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
  } catch (err) {
    console.error("[ComplianceHandler] Failed to handle CUSTOMS_HELD:", err);
  }
});

eventBus.on("CARGO_CLAIM_FILED", async (event) => {
  try {
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
  } catch (err) {
    console.error("[ComplianceHandler] Failed to handle CARGO_CLAIM_FILED:", err);
  }
});

eventBus.on("CARGO_RELEASED", async (event) => {
  try {
    const containerCount = event.data.containerNumbers?.length ?? 0;
    const containerList = event.data.containerNumbers?.join(", ") ?? "N/A";

    console.log(`[ComplianceHandler] CARGO_RELEASED: DO ${event.data.deliveryOrderId}, containers: ${containerCount}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Cargo Released: ${containerCount} containers`,
      body: `Delivery order issued. ${containerList} authorized for release. Consignee notified.`,
      entityType: "delivery_order",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[ComplianceHandler] Failed to handle CARGO_RELEASED:", err);
  }
});
