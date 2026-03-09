/**
 * Event handlers for vessel/voyage cross-module wiring.
 *
 * VESSEL_ARRIVED → notification for port operations, customs clearance
 * VESSEL_DEPARTED → notification for BL issuance, manifest submission
 * VOYAGE_COMPLETED → notification for voyage closure, P&L calculation
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("VESSEL_ARRIVED", async (event) => {
  try {
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
  } catch (err) {
    console.error("[VesselHandler] Failed to handle VESSEL_ARRIVED:", err);
  }
});

eventBus.on("VESSEL_DEPARTED", async (event) => {
  try {
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
  } catch (err) {
    console.error("[VesselHandler] Failed to handle VESSEL_DEPARTED:", err);
  }
});

eventBus.on("VOYAGE_COMPLETED", async (event) => {
  try {
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
  } catch (err) {
    console.error("[VesselHandler] Failed to handle VOYAGE_COMPLETED:", err);
  }
});
