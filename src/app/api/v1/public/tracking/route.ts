import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  odmBillsOfLading,
  cspShipmentTracking,
  cspTrackingEvents,
} from "@/db/schema";
import { eq, or, and, isNull, desc } from "drizzle-orm";

/**
 * ERP-094: Public tracking API — NO auth required.
 * Searches odm_bills_of_lading by blNumber or csp_shipment_tracking by trackingNumber.
 * Returns current status, vessel, voyage, ports, ETA, and timeline events.
 */

const querySchema = z.object({
  q: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid BL or tracking number",
          },
        },
        { status: 400 }
      );
    }

    const { q } = parsed.data;

    // Search shipment tracking first (has more complete status data)
    const [tracking] = await db
      .select()
      .from(cspShipmentTracking)
      .where(
        and(
          or(
            eq(cspShipmentTracking.trackingNumber, q),
            eq(cspShipmentTracking.blNumber, q)
          ),
          isNull(cspShipmentTracking.deletedAt)
        )
      )
      .limit(1);

    if (tracking) {
      // Load tracking events
      const events = await db
        .select({
          eventCode: cspTrackingEvents.eventCode,
          eventDescription: cspTrackingEvents.eventDescription,
          location: cspTrackingEvents.location,
          eventTime: cspTrackingEvents.eventTime,
        })
        .from(cspTrackingEvents)
        .where(
          and(
            eq(cspTrackingEvents.trackingId, tracking.id),
            eq(cspTrackingEvents.isPublic, true),
            isNull(cspTrackingEvents.deletedAt)
          )
        )
        .orderBy(desc(cspTrackingEvents.eventTime))
        .limit(50);

      return NextResponse.json({
        data: {
          blNumber: tracking.blNumber,
          trackingNumber: tracking.trackingNumber,
          currentStatus: tracking.currentStatus,
          vesselName: tracking.vesselName,
          voyageNumber: tracking.voyageNumber,
          originPort: tracking.originPort,
          destinationPort: tracking.destinationPort,
          eta: tracking.eta?.toISOString() ?? null,
          events: events.map((e) => ({
            eventCode: e.eventCode,
            eventDescription: e.eventDescription,
            location: e.location,
            eventTime: e.eventTime.toISOString(),
          })),
        },
      });
    }

    // Fallback: search BL table
    const [bl] = await db
      .select()
      .from(odmBillsOfLading)
      .where(
        and(
          eq(odmBillsOfLading.blNumber, q),
          isNull(odmBillsOfLading.deletedAt)
        )
      )
      .limit(1);

    if (bl) {
      return NextResponse.json({
        data: {
          blNumber: bl.blNumber,
          trackingNumber: null,
          currentStatus: bl.blStatus,
          vesselName: bl.vesselName,
          voyageNumber: bl.voyageNumber,
          originPort: bl.portOfLoading ?? "N/A",
          destinationPort: bl.portOfDischarge ?? "N/A",
          eta: null,
          events: [],
        },
      });
    }

    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "No shipment found for the given reference",
        },
      },
      { status: 404 }
    );
  } catch (err) {
    console.error("[Public Tracking] Error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
