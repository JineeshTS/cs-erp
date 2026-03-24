import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import {
  capVesselSchedules,
  iotVesselPositions,
} from "@/db/schema";
import { tenants } from "@/db/schema/tenants";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { getRedis } from "@/lib/redis";
import { fetchVesselFinderPositions } from "@/lib/tracking/ais-service";

const COOLDOWN_SECONDS = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "iot:read")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    // Rate limiting: 1 poll per 5 minutes per tenant
    const cooldownKey = `ais_poll:${user.tenantId}`;
    let cooldownRemaining = 0;
    try {
      const redis = getRedis();
      const lastPoll = await redis.get(cooldownKey);
      if (lastPoll) {
        const ttl = await redis.ttl(cooldownKey);
        cooldownRemaining = ttl > 0 ? ttl : 0;
      }
    } catch {
      // Redis down — skip rate limiting
    }

    if (cooldownRemaining > 0) {
      const minutes = Math.floor(cooldownRemaining / 60);
      const seconds = cooldownRemaining % 60;
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: `AIS poll cooldown: ${minutes}m ${seconds}s remaining`,
          },
        },
        { status: 429 }
      );
    }

    // Get tenant AIS config from tenant settings
    const [tenant] = await db
      .select({ settings: tenants.settings })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    const tenantSettings = (tenant?.settings ?? {}) as Record<string, unknown>;
    const aisApiKey = tenantSettings.aisApiKey as string | undefined;
    const aisProvider = (tenantSettings.aisProvider as string) || "vesselfinder";

    if (!aisApiKey) {
      return NextResponse.json(
        {
          error: {
            code: "AIS_NOT_CONFIGURED",
            message:
              "AIS API key not configured. Set aisApiKey and aisProvider in tenant settings metadata.",
          },
        },
        { status: 422 }
      );
    }

    // Get distinct vessel IMOs from fleet
    const vessels = await db
      .select({ vesselImo: capVesselSchedules.vesselImo, vesselName: capVesselSchedules.vesselName })
      .from(capVesselSchedules)
      .where(
        and(
          eq(capVesselSchedules.tenantId, user.tenantId),
          isNull(capVesselSchedules.deletedAt),
          isNotNull(capVesselSchedules.vesselImo)
        )
      )
      .limit(100);

    const uniqueImos = [...new Set(vessels.filter((v) => v.vesselImo).map((v) => v.vesselImo!))];

    if (uniqueImos.length === 0) {
      return NextResponse.json({
        data: { polled: 0, updated: 0, provider: aisProvider },
      });
    }

    // Poll AIS provider
    let positions;
    if (aisProvider === "vesselfinder") {
      positions = await fetchVesselFinderPositions(aisApiKey, uniqueImos);
    } else {
      return NextResponse.json(
        {
          error: {
            code: "UNSUPPORTED_PROVIDER",
            message: `AIS provider '${aisProvider}' is not supported. Use 'vesselfinder'.`,
          },
        },
        { status: 422 }
      );
    }

    if (positions.errors.length > 0 && positions.positions.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "AIS_PROVIDER_ERROR",
            message: positions.errors[0],
          },
        },
        { status: 502 }
      );
    }

    // Insert positions into iot_vessel_positions
    let insertedCount = 0;
    for (const pos of positions.positions) {
      const now = new Date();
      const ref = `AIS-${pos.imo}-${Math.floor(now.getTime() / 1000)}`;

      await db.insert(iotVesselPositions).values({
        tenantId: user.tenantId,
        positionRef: ref,
        positionType: "ais_report",
        vesselName: pos.vesselName,
        vesselImo: pos.imo,
        mmsi: pos.mmsi,
        latitude: String(pos.latitude),
        longitude: String(pos.longitude),
        courseOverGround: String(pos.courseOverGround),
        speedOverGround: String(pos.speedOverGround),
        navStatus: pos.navStatus,
        destination: pos.destination,
        eta: pos.eta ? new Date(pos.eta) : null,
        draught: pos.draught ? String(pos.draught) : null,
        status: "active",
      });
      insertedCount++;
    }

    // Set cooldown in Redis
    try {
      const redis = getRedis();
      await redis.setex(cooldownKey, COOLDOWN_SECONDS, "1");
    } catch {
      // Redis down — skip cooldown tracking
    }

    return NextResponse.json({
      data: {
        polled: uniqueImos.length,
        updated: insertedCount,
        provider: aisProvider,
        ...(positions.errors.length > 0
          ? { warnings: positions.errors }
          : {}),
      },
    });
  } catch (error) {
    console.error("AIS poll error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to poll AIS positions",
        },
      },
      { status: 500 }
    );
  }
}
