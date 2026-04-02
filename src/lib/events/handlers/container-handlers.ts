/**
 * Event handlers for container/equipment cross-module wiring.
 *
 * CONTAINER_GATE_IN → gate movement record + fleet status update + notification
 * CONTAINER_GATE_OUT → gate movement record + fleet status update + notification
 * CONTAINER_DAMAGED → MNR repair record + fleet status update + notification
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import {
  wneNotifications,
  eqyGateMovements,
  eqyContainerFleet,
  eqyMaintenanceRepairs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

eventBus.on("CONTAINER_GATE_IN", async (event) => {
  try {
    console.log(`[ContainerHandler] GATE_IN: ${event.data.containerNumber} at terminal ${event.data.terminalId}`);

    // 1. Record gate movement
    await db.insert(eqyGateMovements).values({
      tenantId: event.tenantId,
      movementReference: `GTIN-${Date.now()}-${event.data.containerNumber}`,
      movementType: "gate_in",
      containerNumber: event.data.containerNumber,
      sealNumber: event.data.sealNumber ?? null,
      movementTimestamp: event.timestamp,
      status: "completed",
    });

    // 2. Update container fleet status
    await db
      .update(eqyContainerFleet)
      .set({
        currentStatus: "in_yard",
        currentLocation: event.data.terminalId,
        lastMovementDate: event.timestamp,
      })
      .where(
        and(
          eq(eqyContainerFleet.containerNumber, event.data.containerNumber),
          eq(eqyContainerFleet.tenantId, event.tenantId)
        )
      );

    // 3. Notification
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
  } catch (err) {
    console.error("[ContainerHandler] Failed to handle CONTAINER_GATE_IN:", err);
  }
});

eventBus.on("CONTAINER_GATE_OUT", async (event) => {
  try {
    console.log(`[ContainerHandler] GATE_OUT: ${event.data.containerNumber} from terminal ${event.data.terminalId}`);

    // 1. Record gate movement
    await db.insert(eqyGateMovements).values({
      tenantId: event.tenantId,
      movementReference: `GTOUT-${Date.now()}-${event.data.containerNumber}`,
      movementType: "gate_out",
      containerNumber: event.data.containerNumber,
      movementTimestamp: event.timestamp,
      status: "completed",
    });

    // 2. Update container fleet status
    await db
      .update(eqyContainerFleet)
      .set({
        currentStatus: "in_transit",
        lastMovementDate: event.timestamp,
      })
      .where(
        and(
          eq(eqyContainerFleet.containerNumber, event.data.containerNumber),
          eq(eqyContainerFleet.tenantId, event.tenantId)
        )
      );

    // 3. Notification
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
  } catch (err) {
    console.error("[ContainerHandler] Failed to handle CONTAINER_GATE_OUT:", err);
  }
});

eventBus.on("CONTAINER_DAMAGED", async (event) => {
  try {
    console.log(`[ContainerHandler] DAMAGED: ${event.data.containerNumber} — ${event.data.severity} ${event.data.damageType}`);

    // 1. Create MNR (Maintenance & Repair) record
    await db.insert(eqyMaintenanceRepairs).values({
      tenantId: event.tenantId,
      containerNumber: event.data.containerNumber,
      mnrReference: `MNR-${Date.now()}-${event.data.containerNumber}`,
      repairType: event.data.damageType,
      damageDescription: `${event.data.severity} ${event.data.damageType} damage detected`,
      estimatedCost: event.data.estimatedRepairCost ?? null,
      inspectionDate: event.timestamp,
      status: "reported",
      approvalStatus: "pending",
    });

    // 2. Update container fleet status to damaged
    await db
      .update(eqyContainerFleet)
      .set({
        currentStatus: "damaged",
        lastMovementDate: event.timestamp,
      })
      .where(
        and(
          eq(eqyContainerFleet.containerNumber, event.data.containerNumber),
          eq(eqyContainerFleet.tenantId, event.tenantId)
        )
      );

    // 3. Notification
    const priority = event.data.severity === "severe" ? "urgent" : event.data.severity === "moderate" ? "high" : "normal";

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Container Damage: ${event.data.containerNumber}`,
      body: `${event.data.severity.toUpperCase()} ${event.data.damageType} detected. Est. repair: ${event.data.estimatedRepairCost ? `$${event.data.estimatedRepairCost}` : "TBD"}. MNR record created, repair authorization required.`,
      entityType: "container",
      entityId: event.entityId,
      priority,
      status: "pending",
    });
  } catch (err) {
    console.error("[ContainerHandler] Failed to handle CONTAINER_DAMAGED:", err);
  }
});
