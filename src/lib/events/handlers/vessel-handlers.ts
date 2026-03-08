/**
 * Event handlers for vessel/voyage cross-module wiring.
 *
 * VESSEL_ARRIVED → triggers port operations, customs notification, berth assignment
 * VESSEL_DEPARTED → triggers BL issuance, tracking update, next-port notification
 * VOYAGE_COMPLETED → triggers voyage closure, P&L calculation, analytics
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("VESSEL_ARRIVED", async (event) => {
  console.log(`[VesselHandler] ARRIVED: ${event.data.vesselName} at port ${event.data.portId}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Vessel Arrived: ${event.data.vesselName}`,
    body: `Vessel arrived at port. Discharge operations, customs clearance, and cargo release procedures to commence.`,
    entityType: "vessel",
    entityId: event.entityId,
    priority: "high",
    status: "pending",
  });
});

eventBus.on("VESSEL_DEPARTED", async (event) => {
  console.log(`[VesselHandler] DEPARTED: ${event.data.vesselName} from port ${event.data.portId}, next: ${event.data.nextPortId}`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Vessel Departed: ${event.data.vesselName}`,
    body: `Vessel departed. B/L issuance, manifest submission, and advance customs filing for next port required.`,
    entityType: "vessel",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});

eventBus.on("VOYAGE_COMPLETED", async (event) => {
  console.log(`[VesselHandler] VOYAGE_COMPLETED: voyage ${event.data.voyageId}, duration: ${event.data.actualDuration}h`);

  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Voyage Completed: ${event.data.voyageId}`,
    body: `Voyage completed in ${event.data.actualDuration} hours. Voyage closure, P&L calculation, and settlement processing required.`,
    entityType: "voyage",
    entityId: event.entityId,
    priority: "normal",
    status: "pending",
  });
});
