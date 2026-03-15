import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ports, iotContainerGpsTrackings } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";
import crypto from "crypto";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

const EVENT_TYPES = [
  "gate_in",
  "gate_out",
  "vessel_load",
  "vessel_discharge",
  "customs_release",
  "delivered",
  "transshipment",
  "rail_departure",
  "rail_arrival",
] as const;

const containerEventSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  eventType: z.enum(EVENT_TYPES),
  locationCode: z.string().min(2).max(10),
  locationName: z.string().max(255).optional(),
  timestamp: z.string().datetime(),
  containerType: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth: Bearer token OR webhook signature
    const user = await getApiUser(request);
    let tenantId: string;

    if (user) {
      if (!(await hasPermission(user.id, user.tenantId, "iot:read")))
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
          { status: 403 }
        );
      tenantId = user.tenantId;
    } else {
      // Check HMAC webhook signature
      const signature = request.headers.get("x-webhook-signature");
      const webhookTenantId = request.headers.get("x-tenant-id");

      if (!signature || !webhookTenantId) return unauthorizedResponse();

      // Webhooks use HMAC signature auth, not CSRF tokens
      const body = await request.text();
      const secret = process.env.TRACKING_WEBHOOK_SECRET;
      if (!secret) {
        return NextResponse.json(
          { error: { code: "SERVER_ERROR", message: "Webhook secret not configured" } },
          { status: 500 }
        );
      }

      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Invalid webhook signature" } },
          { status: 401 }
        );
      }

      tenantId = webhookTenantId;

      // Re-parse body since we consumed it
      const parsed = containerEventSchema.safeParse(JSON.parse(body));
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: formatZodErrors(parsed.error) } },
          { status: 422 }
        );
      }

      return await processEvent(tenantId, parsed.data);
    }

    // Standard auth flow — parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }

    const parsed = containerEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    return await processEvent(tenantId, parsed.data);
  } catch (error) {
    console.error("Container event error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process container event" } },
      { status: 500 }
    );
  }
}

async function processEvent(
  tenantId: string,
  data: z.infer<typeof containerEventSchema>
) {
  // Look up port by UN/LOCODE to get coordinates
  let latitude: string | null = null;
  let longitude: string | null = null;
  let resolvedName = data.locationName || data.locationCode;

  const [port] = await db
    .select({
      lat: ports.latitude,
      lng: ports.longitude,
      name: ports.name,
    })
    .from(ports)
    .where(
      and(
        eq(ports.tenantId, tenantId),
        eq(ports.unLocode, data.locationCode),
        isNull(ports.deletedAt)
      )
    )
    .limit(1);

  if (port?.lat && port?.lng) {
    latitude = port.lat;
    longitude = port.lng;
    resolvedName = port.name;
  }

  const now = new Date();
  const ref = `EVT-${data.containerNumber}-${Math.floor(now.getTime() / 1000)}`;

  const [record] = await db
    .insert(iotContainerGpsTrackings)
    .values({
      tenantId,
      trackingRef: ref,
      trackingType: "milestone_update",
      containerNumber: data.containerNumber,
      containerType: data.containerType || null,
      latitude,
      longitude,
      speed: null,
      heading: null,
      locationName: resolvedName,
      deviceId: null,
      batteryLevel: null,
      signalStrength: null,
      status: "active",
      metadata: {
        eventType: data.eventType,
        locationCode: data.locationCode,
        eventTimestamp: data.timestamp,
        ...(data.metadata || {}),
      },
    })
    .returning({ id: iotContainerGpsTrackings.id });

  return NextResponse.json(
    {
      data: {
        id: record.id,
        containerNumber: data.containerNumber,
        trackingType: "milestone_update",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
    },
    { status: 201 }
  );
}
