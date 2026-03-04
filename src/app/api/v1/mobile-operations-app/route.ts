import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  mobGateProcessings,
  mobYardInspections,
  mobContainerSurveys,
  mobOfflineSyncs,
  mobDamageAssessments,
  mobDriverDeliveries,
  mobExecutiveDashboards,
  mobPushNotifications,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mob:read")))
      return forbiddenResponse();

    const [
      draftGateProcessings,
      draftYardInspections,
      draftContainerSurveys,
      draftOfflineSyncs,
      draftDamageAssessments,
      draftDriverDeliveries,
      draftExecutiveDashboards,
      draftPushNotifications,
    ] = await Promise.all([
      db.select({ id: mobGateProcessings.id }).from(mobGateProcessings)
        .where(and(eq(mobGateProcessings.tenantId, user.tenantId), isNull(mobGateProcessings.deletedAt), eq(mobGateProcessings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobYardInspections.id }).from(mobYardInspections)
        .where(and(eq(mobYardInspections.tenantId, user.tenantId), isNull(mobYardInspections.deletedAt), eq(mobYardInspections.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobContainerSurveys.id }).from(mobContainerSurveys)
        .where(and(eq(mobContainerSurveys.tenantId, user.tenantId), isNull(mobContainerSurveys.deletedAt), eq(mobContainerSurveys.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobOfflineSyncs.id }).from(mobOfflineSyncs)
        .where(and(eq(mobOfflineSyncs.tenantId, user.tenantId), isNull(mobOfflineSyncs.deletedAt), eq(mobOfflineSyncs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobDamageAssessments.id }).from(mobDamageAssessments)
        .where(and(eq(mobDamageAssessments.tenantId, user.tenantId), isNull(mobDamageAssessments.deletedAt), eq(mobDamageAssessments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobDriverDeliveries.id }).from(mobDriverDeliveries)
        .where(and(eq(mobDriverDeliveries.tenantId, user.tenantId), isNull(mobDriverDeliveries.deletedAt), eq(mobDriverDeliveries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobExecutiveDashboards.id }).from(mobExecutiveDashboards)
        .where(and(eq(mobExecutiveDashboards.tenantId, user.tenantId), isNull(mobExecutiveDashboards.deletedAt), eq(mobExecutiveDashboards.status, "draft")))
        .then((r) => r.length),
      db.select({ id: mobPushNotifications.id }).from(mobPushNotifications)
        .where(and(eq(mobPushNotifications.tenantId, user.tenantId), isNull(mobPushNotifications.deletedAt), eq(mobPushNotifications.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftGateProcessings,
        draftYardInspections,
        draftContainerSurveys,
        draftOfflineSyncs,
        draftDamageAssessments,
        draftDriverDeliveries,
        draftExecutiveDashboards,
        draftPushNotifications,
      },
    });
  } catch (error) {
    console.error("Failed to get Mobile Ops hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
