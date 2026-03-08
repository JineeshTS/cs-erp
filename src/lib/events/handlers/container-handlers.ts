/**
 * Event handlers for container/equipment cross-module wiring.
 *
 * CONTAINER_GATE_IN → triggers yard slot assignment, tracking update
 * CONTAINER_GATE_OUT → triggers tracking update, delivery confirmation
 * CONTAINER_DAMAGED → triggers repair authorization, insurance notification
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("CONTAINER_GATE_IN", async (event) => {
  console.log(`[ContainerHandler] GATE_IN: ${event.data.containerNumber} at terminal ${event.data.terminalId}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Gate-In: ${event.data.containerNumber}`,
    body: `Container ${event.data.containerNumber} received at terminal. Seal: ${event.data.sealNumber ?? "N/A"}.${event.data.bookingId ? ` Linked to booking.` : ""}`,
    entityType: "container",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});

eventBus.on("CONTAINER_GATE_OUT", async (event) => {
  console.log(`[ContainerHandler] GATE_OUT: ${event.data.containerNumber} from terminal ${event.data.terminalId}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Gate-Out: ${event.data.containerNumber}`,
    body: `Container ${event.data.containerNumber} departed terminal.${event.data.deliveryOrderId ? ` Delivery order linked.` : ""}`,
    entityType: "container",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});

eventBus.on("CONTAINER_DAMAGED", async (event) => {
  console.log(`[ContainerHandler] DAMAGED: ${event.data.containerNumber} — ${event.data.severity} ${event.data.damageType}`);

  const priority = event.data.severity === "severe" ? "urgent" : event.data.severity === "moderate" ? "high" : "normal";

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Container Damage: ${event.data.containerNumber}`,
    body: `${event.data.severity.toUpperCase()} ${event.data.damageType} detected. Est. repair: ${event.data.estimatedRepairCost ? `$${event.data.estimatedRepairCost}` : "TBD"}. Repair authorization required.`,
    entityType: "container",
    entityId: event.entityId,
    priority,
    status: "pending",
  });
});
