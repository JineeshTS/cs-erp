/**
 * Booking Space Allocation Engine (ERP-114)
 *
 * Checks vessel capacity against confirmed bookings and allocates space.
 * Uses cap_space_controls for booking records and cap_vessel_schedules for capacity.
 */

import { db } from "@/lib/db";
import { capSpaceControls, capVesselSchedules } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export interface SpaceAvailability {
  voyageId: string;
  containerType: string;
  totalCapacityTeu: number;
  allocatedTeu: number;
  remainingTeu: number;
  requestedTeu: number;
  available: boolean;
  isOverbooked: boolean;
}

export interface AllocationResult {
  id: string;
  bookingId: string;
  voyageId: string;
  allocated: number;
  remaining: number;
  isOverbooked: boolean;
}

/**
 * Check space availability on a voyage for a given container type and quantity.
 */
export async function checkSpaceAvailability(
  tenantId: string,
  voyageId: string,
  containerType: string,
  quantity: number
): Promise<SpaceAvailability> {
  // Get vessel capacity from schedule
  const [schedule] = await db
    .select({ totalCapacityTeu: capVesselSchedules.totalCapacityTeu })
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, voyageId),
        eq(capVesselSchedules.tenantId, tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1);

  const totalCapacityTeu = schedule?.totalCapacityTeu ?? 0;

  // Sum confirmed bookings for this voyage + container type
  const [booked] = await db
    .select({
      allocatedTeu: sql<number>`COALESCE(SUM(${capSpaceControls.quantityTeu}), 0)`,
    })
    .from(capSpaceControls)
    .where(
      and(
        eq(capSpaceControls.tenantId, tenantId),
        eq(capSpaceControls.vesselScheduleId, voyageId),
        eq(capSpaceControls.containerType, containerType),
        isNull(capSpaceControls.deletedAt),
        sql`${capSpaceControls.status} IN ('pending', 'confirmed')`
      )
    );

  const allocatedTeu = Number(booked?.allocatedTeu ?? 0);
  const remainingTeu = totalCapacityTeu - allocatedTeu;
  const available = remainingTeu >= quantity;
  const isOverbooked = allocatedTeu + quantity > totalCapacityTeu;

  return {
    voyageId,
    containerType,
    totalCapacityTeu,
    allocatedTeu,
    remainingTeu,
    requestedTeu: quantity,
    available,
    isOverbooked,
  };
}

/**
 * Allocate space on a voyage for a booking.
 * Creates a cap_space_controls record. Allows overbooking (returns isOverbooked flag).
 */
export async function allocateSpace(
  tenantId: string,
  bookingId: string,
  voyageId: string,
  quantity: number
): Promise<AllocationResult> {
  // Check current availability before allocation
  const availability = await checkSpaceAvailability(tenantId, voyageId, "20GP", quantity);

  const [record] = await db
    .insert(capSpaceControls)
    .values({
      tenantId,
      vesselScheduleId: voyageId,
      bookingReference: bookingId,
      containerType: "20GP",
      containerSize: "20",
      quantityTeu: quantity,
      status: "confirmed",
      bookingDate: new Date(),
    })
    .returning();

  const newAllocated = availability.allocatedTeu + quantity;
  const remaining = availability.totalCapacityTeu - newAllocated;

  return {
    id: record.id,
    bookingId,
    voyageId,
    allocated: newAllocated,
    remaining: Math.max(0, remaining),
    isOverbooked: newAllocated > availability.totalCapacityTeu,
  };
}
