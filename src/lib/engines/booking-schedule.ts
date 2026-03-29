/**
 * Booking–Schedule Link Engine (ERP-115)
 *
 * Links bookings to vessel schedules/voyages and retrieves
 * the linked voyage + port call ETAs for a booking.
 *
 * The csp_portal_bookings table stores bookings with a voyage reference
 * in metadata. This engine manages that linkage to cap_vessel_schedules
 * and cap_port_rotations.
 */

import { db } from "@/lib/db";
import {
  cspPortalBookings,
  capVesselSchedules,
  capPortRotations,
} from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

export interface BookingScheduleInfo {
  bookingId: string;
  bookingRef: string;
  voyageId: string | null;
  vesselName: string | null;
  serviceName: string | null;
  portCalls: Array<{
    portCode: string;
    portName: string;
    sequence: number;
    eta: Date | null;
    etd: Date | null;
  }>;
}

/**
 * Link a booking to a vessel schedule/voyage.
 * Stores the voyage ID in the booking's metadata.
 */
export async function linkBookingToSchedule(
  tenantId: string,
  bookingId: string,
  voyageId: string
): Promise<{ bookingId: string; voyageId: string; linked: boolean }> {
  // Verify the voyage exists
  const [voyage] = await db
    .select({ id: capVesselSchedules.id })
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, voyageId),
        eq(capVesselSchedules.tenantId, tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1);

  if (!voyage) {
    throw new Error(`Voyage ${voyageId} not found for tenant`);
  }

  // Update booking metadata with voyage reference
  const [updated] = await db
    .update(cspPortalBookings)
    .set({
      metadata: { voyageId },
    })
    .where(
      and(
        eq(cspPortalBookings.id, bookingId),
        eq(cspPortalBookings.tenantId, tenantId),
        isNull(cspPortalBookings.deletedAt)
      )
    )
    .returning({ id: cspPortalBookings.id });

  return {
    bookingId,
    voyageId,
    linked: !!updated,
  };
}

/**
 * Get the linked voyage + port call ETAs for a booking.
 */
export async function getBookingScheduleInfo(
  tenantId: string,
  bookingId: string
): Promise<BookingScheduleInfo> {
  // Fetch the booking
  const [booking] = await db
    .select({
      id: cspPortalBookings.id,
      bookingRef: cspPortalBookings.bookingRef,
      metadata: cspPortalBookings.metadata,
    })
    .from(cspPortalBookings)
    .where(
      and(
        eq(cspPortalBookings.id, bookingId),
        eq(cspPortalBookings.tenantId, tenantId),
        isNull(cspPortalBookings.deletedAt)
      )
    )
    .limit(1);

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const meta = booking.metadata as Record<string, unknown> | null;
  const voyageId = (meta?.voyageId as string) ?? null;

  if (!voyageId) {
    return {
      bookingId,
      bookingRef: booking.bookingRef,
      voyageId: null,
      vesselName: null,
      serviceName: null,
      portCalls: [],
    };
  }

  // Fetch voyage details
  const [voyage] = await db
    .select({
      id: capVesselSchedules.id,
      vesselName: capVesselSchedules.vesselName,
      serviceName: capVesselSchedules.serviceName,
    })
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, voyageId),
        eq(capVesselSchedules.tenantId, tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1);

  // Fetch port calls ordered by sequence
  const portCalls = await db
    .select({
      portCode: capPortRotations.portCode,
      portName: capPortRotations.portName,
      sequence: capPortRotations.sequenceNumber,
      eta: capPortRotations.arrivalEta,
      etd: capPortRotations.departureEtd,
    })
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.vesselScheduleId, voyageId),
        eq(capPortRotations.tenantId, tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .orderBy(asc(capPortRotations.sequenceNumber));

  return {
    bookingId,
    bookingRef: booking.bookingRef,
    voyageId,
    vesselName: voyage?.vesselName ?? null,
    serviceName: voyage?.serviceName ?? null,
    portCalls: portCalls.map((pc) => ({
      portCode: pc.portCode,
      portName: pc.portName,
      sequence: pc.sequence,
      eta: pc.eta,
      etd: pc.etd,
    })),
  };
}
