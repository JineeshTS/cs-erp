/**
 * Event handlers for booking & documentation cross-module wiring.
 *
 * BOOKING_CREATED → notification for container allocation
 * BOOKING_CONFIRMED → notification for shipping instructions prep
 * BOOKING_CANCELLED → notification for space/equipment release
 * BL_ISSUED → notification for BL review and distribution
 * BL_SURRENDERED → notification for cargo release authorization
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("BOOKING_CREATED", async (event) => {
  try {
    console.log(`[BookingHandler] BOOKING_CREATED: ${event.data.bookingNumber} (tenant: ${event.tenantId})`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `New Booking: ${event.data.bookingNumber}`,
      body: `Booking created for ${event.data.containerCount} containers on ${event.data.tradeRoute}. Container allocation required.`,
      entityType: "booking",
      entityId: event.entityId,
      priority: "normal",
      status: "pending",
    });
  } catch (err) {
    console.error("[BookingHandler] Failed to handle BOOKING_CREATED:", err);
  }
});

eventBus.on("BOOKING_CONFIRMED", async (event) => {
  try {
    console.log(`[BookingHandler] BOOKING_CONFIRMED: ${event.data.bookingNumber} (tenant: ${event.tenantId})`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Booking Confirmed: ${event.data.bookingNumber}`,
      body: `Booking confirmed on voyage ${event.data.voyageId}. Shipping instructions and draft B/L preparation required.`,
      entityType: "booking",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[BookingHandler] Failed to handle BOOKING_CONFIRMED:", err);
  }
});

eventBus.on("BOOKING_CANCELLED", async (event) => {
  try {
    console.log(`[BookingHandler] BOOKING_CANCELLED: ${event.data.bookingNumber} — reason: ${event.data.reason}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `Booking Cancelled: ${event.data.bookingNumber}`,
      body: `Booking cancelled. Reason: ${event.data.reason}. Container allocation and space to be released.`,
      entityType: "booking",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[BookingHandler] Failed to handle BOOKING_CANCELLED:", err);
  }
});

eventBus.on("BL_ISSUED", async (event) => {
  try {
    console.log(`[BookingHandler] BL_ISSUED: ${event.data.blNumber} for booking ${event.data.bookingId}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `B/L Issued: ${event.data.blNumber}`,
      body: `Bill of Lading generated. Draft B/L ready for review and customer approval before release.`,
      entityType: "bill_of_lading",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[BookingHandler] Failed to handle BL_ISSUED:", err);
  }
});

eventBus.on("BL_SURRENDERED", async (event) => {
  try {
    console.log(`[BookingHandler] BL_SURRENDERED: ${event.data.blNumber} for booking ${event.data.bookingId}`);

    await db.insert(wneNotifications).values({
      tenantId: event.tenantId,
      userId: event.userId,
      channel: "in_app",
      title: `B/L Surrendered: ${event.data.blNumber}`,
      body: `Bill of Lading surrendered. Cargo release authorization and delivery order processing can proceed.`,
      entityType: "bill_of_lading",
      entityId: event.entityId,
      priority: "high",
      status: "pending",
    });
  } catch (err) {
    console.error("[BookingHandler] Failed to handle BL_SURRENDERED:", err);
  }
});
