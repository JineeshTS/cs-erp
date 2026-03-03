import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  iotContainerGpsTrackings,
  iotReeferMonitorings,
  iotElectronicSeals,
  iotShockDetections,
  iotVesselPositions,
  iotPortEquipments,
  iotPredictiveAlerts,
  iotDataLakeAnalytics,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "iot:read")))
      return forbiddenResponse();

    const [
      draftContainerGps,
      draftReeferMonitorings,
      draftElectronicSeals,
      draftShockDetections,
      draftVesselPositions,
      draftPortEquipments,
      draftPredictiveAlerts,
      draftDataLakeAnalytics,
    ] = await Promise.all([
      db.select({ id: iotContainerGpsTrackings.id }).from(iotContainerGpsTrackings)
        .where(and(eq(iotContainerGpsTrackings.tenantId, user.tenantId), isNull(iotContainerGpsTrackings.deletedAt), eq(iotContainerGpsTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotReeferMonitorings.id }).from(iotReeferMonitorings)
        .where(and(eq(iotReeferMonitorings.tenantId, user.tenantId), isNull(iotReeferMonitorings.deletedAt), eq(iotReeferMonitorings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotElectronicSeals.id }).from(iotElectronicSeals)
        .where(and(eq(iotElectronicSeals.tenantId, user.tenantId), isNull(iotElectronicSeals.deletedAt), eq(iotElectronicSeals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotShockDetections.id }).from(iotShockDetections)
        .where(and(eq(iotShockDetections.tenantId, user.tenantId), isNull(iotShockDetections.deletedAt), eq(iotShockDetections.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotVesselPositions.id }).from(iotVesselPositions)
        .where(and(eq(iotVesselPositions.tenantId, user.tenantId), isNull(iotVesselPositions.deletedAt), eq(iotVesselPositions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotPortEquipments.id }).from(iotPortEquipments)
        .where(and(eq(iotPortEquipments.tenantId, user.tenantId), isNull(iotPortEquipments.deletedAt), eq(iotPortEquipments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotPredictiveAlerts.id }).from(iotPredictiveAlerts)
        .where(and(eq(iotPredictiveAlerts.tenantId, user.tenantId), isNull(iotPredictiveAlerts.deletedAt), eq(iotPredictiveAlerts.status, "draft")))
        .then((r) => r.length),
      db.select({ id: iotDataLakeAnalytics.id }).from(iotDataLakeAnalytics)
        .where(and(eq(iotDataLakeAnalytics.tenantId, user.tenantId), isNull(iotDataLakeAnalytics.deletedAt), eq(iotDataLakeAnalytics.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftContainerGps,
        draftReeferMonitorings,
        draftElectronicSeals,
        draftShockDetections,
        draftVesselPositions,
        draftPortEquipments,
        draftPredictiveAlerts,
        draftDataLakeAnalytics,
      },
    });
  } catch (error) {
    console.error("Failed to get IoT hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
