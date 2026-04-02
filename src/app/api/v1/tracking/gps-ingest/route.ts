import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { iotContainerGpsTrackings } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import crypto from "crypto";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

const positionSchema = z.object({
  deviceId: z.string().min(1).max(100),
  containerNumber: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  altitude: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().int().optional(),
  timestamp: z.string().datetime(),
});

const batchSchema = z.object({
  positions: z.array(positionSchema).min(1).max(100),
});

const singleOrBatchSchema = z.union([positionSchema, batchSchema]);

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
      // HMAC webhook signature auth
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

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Invalid webhook signature" } },
          { status: 401 }
        );
      }

      // CSERP-011: Extract tenant_id from the HMAC-signed body (not from spoofable header)
      const bodyJson = JSON.parse(body);
      tenantId = bodyJson.tenant_id ?? webhookTenantId;
      if (!tenantId) return unauthorizedResponse();

      const parsed = singleOrBatchSchema.safeParse(bodyJson);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: formatZodErrors(parsed.error) } },
          { status: 422 }
        );
      }

      return await processGpsData(tenantId, parsed.data);
    }

    // Standard auth flow
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }

    const parsed = singleOrBatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    return await processGpsData(tenantId, parsed.data);
  } catch (error) {
    console.error("GPS ingest error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to ingest GPS data" } },
      { status: 500 }
    );
  }
}

type SinglePosition = z.infer<typeof positionSchema>;
type BatchPayload = z.infer<typeof batchSchema>;

async function processGpsData(
  tenantId: string,
  data: SinglePosition | BatchPayload
) {
  const positions: SinglePosition[] =
    "positions" in data ? data.positions : [data];

  const now = new Date();
  const values = positions.map((pos) => {
    const ts = Math.floor(new Date(pos.timestamp).getTime() / 1000);
    return {
      tenantId,
      trackingRef: `GPS-${pos.deviceId}-${ts}`,
      trackingType: "real_time" as const,
      containerNumber: pos.containerNumber || null,
      containerType: null,
      latitude: String(pos.latitude),
      longitude: String(pos.longitude),
      altitude: pos.altitude != null ? String(pos.altitude) : null,
      speed: pos.speed != null ? String(pos.speed) : null,
      heading: pos.heading != null ? String(pos.heading) : null,
      locationName: null,
      geofenceId: null,
      deviceId: pos.deviceId,
      batteryLevel: pos.batteryLevel != null ? String(pos.batteryLevel) : null,
      signalStrength: pos.signalStrength ?? null,
      status: "active" as const,
      metadata: { ingestedAt: now.toISOString(), sourceTimestamp: pos.timestamp },
    };
  });

  const inserted = await db
    .insert(iotContainerGpsTrackings)
    .values(values)
    .returning({ id: iotContainerGpsTrackings.id });

  const ids = inserted.map((r) => r.id);

  if (positions.length === 1) {
    return NextResponse.json(
      {
        data: {
          id: ids[0],
          trackingRef: values[0].trackingRef,
        },
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      data: {
        inserted: ids.length,
        ids,
      },
    },
    { status: 201 }
  );
}
