import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import {
  ports,
  iotVesselPositions,
  iotContainerGpsTrackings,
} from "@/db/schema";
import { TrackingDashboard } from "./tracking-dashboard";
import type { MapData } from "@/components/tracking/tracking-map";

export default async function TrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/");

  const [portData, vesselData, containerData] = await Promise.all([
    db
      .select({
        id: ports.id,
        name: ports.name,
        unLocode: ports.unLocode,
        country: ports.country,
        lat: ports.latitude,
        lng: ports.longitude,
        portType: ports.portType,
      })
      .from(ports)
      .where(
        and(
          eq(ports.tenantId, session.tenantId),
          isNull(ports.deletedAt),
          eq(ports.status, "active"),
          sql`${ports.latitude} IS NOT NULL`,
          sql`${ports.longitude} IS NOT NULL`
        )
      )
      .limit(200),
    db
      .select()
      .from(iotVesselPositions)
      .where(
        and(
          eq(iotVesselPositions.tenantId, session.tenantId),
          isNull(iotVesselPositions.deletedAt),
          sql`${iotVesselPositions.latitude} IS NOT NULL`,
          sql`${iotVesselPositions.longitude} IS NOT NULL`
        )
      )
      .orderBy(desc(iotVesselPositions.createdAt))
      .limit(200),
    db
      .select()
      .from(iotContainerGpsTrackings)
      .where(
        and(
          eq(iotContainerGpsTrackings.tenantId, session.tenantId),
          isNull(iotContainerGpsTrackings.deletedAt),
          sql`${iotContainerGpsTrackings.latitude} IS NOT NULL`,
          sql`${iotContainerGpsTrackings.longitude} IS NOT NULL`
        )
      )
      .orderBy(desc(iotContainerGpsTrackings.createdAt))
      .limit(200),
  ]);

  const mapData: MapData = {
    ports: portData
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        id: p.id,
        name: p.name,
        unLocode: p.unLocode,
        country: p.country,
        lat: Number(p.lat),
        lng: Number(p.lng),
        portType: p.portType,
      })),
    vessels: vesselData
      .filter((v) => v.latitude && v.longitude)
      .map((v) => ({
        id: v.id,
        name: v.vesselName || "Unknown",
        imo: v.vesselImo || "",
        mmsi: v.mmsi || "",
        lat: Number(v.latitude),
        lng: Number(v.longitude),
        course: Number(v.courseOverGround) || 0,
        speed: Number(v.speedOverGround) || 0,
        navStatus: v.navStatus || "",
        destination: v.destination || "",
        eta: v.eta?.toISOString() ?? null,
        updatedAt: v.updatedAt.toISOString(),
      })),
    containers: containerData
      .filter((c) => c.latitude && c.longitude)
      .map((c) => ({
        id: c.id,
        containerNumber: c.containerNumber || "Unknown",
        containerType: c.containerType || "",
        lat: Number(c.latitude),
        lng: Number(c.longitude),
        speed: Number(c.speed) || 0,
        heading: Number(c.heading) || 0,
        locationName: c.locationName || "",
        deviceId: c.deviceId || "",
        batteryLevel: c.batteryLevel ? Number(c.batteryLevel) : null,
        trackingType: c.trackingType || "",
        updatedAt: c.updatedAt.toISOString(),
      })),
  };

  return <TrackingDashboard initialData={mapData} />;
}
