/**
 * Event handlers for booking-related cross-module wiring.
 *
 * BOOKING_CREATED → triggers container allocation check, space verification
 * BOOKING_CONFIRMED → triggers documentation prep, capacity update
 * BOOKING_CANCELLED → triggers container release, space restoration
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("BOOKING_CREATED", async (event) => {
  console.log(`[BookingHandler] BOOKING_CREATED: ${event.data.bookingNumber} (tenant: ${event.tenantId})`);

  // Create in-app notification for operations team
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
});

eventBus.on("BOOKING_CONFIRMED", async (event) => {
  console.log(`[BookingHandler] BOOKING_CONFIRMED: ${event.data.bookingNumber} (tenant: ${event.tenantId})`);

  // Notify documentation team to prepare shipping instructions
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
});

eventBus.on("BOOKING_CANCELLED", async (event) => {
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
});
