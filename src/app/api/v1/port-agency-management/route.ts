import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pamPortCallPlans,
  pamHusbandryServices,
  pamPreArrivalChecklists,
  pamPortAuthorityCommunications,
  pamCrewChangeCoordinations,
  pamCashToMasters,
  pamVesselClearances,
  pamDisbursementAccounts,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:read")))
      return forbiddenResponse();

    const [
      plannedPortCalls,
      pendingServices,
      pendingChecklists,
      activeCommunications,
      plannedCrewChanges,
      pendingCash,
      pendingClearances,
      draftDisbursements,
    ] = await Promise.all([
      db.select({ id: pamPortCallPlans.id }).from(pamPortCallPlans)
        .where(and(eq(pamPortCallPlans.tenantId, user.tenantId), isNull(pamPortCallPlans.deletedAt), eq(pamPortCallPlans.status, "planned")))
        .then((r) => r.length),
      db.select({ id: pamHusbandryServices.id }).from(pamHusbandryServices)
        .where(and(eq(pamHusbandryServices.tenantId, user.tenantId), isNull(pamHusbandryServices.deletedAt), eq(pamHusbandryServices.status, "requested")))
        .then((r) => r.length),
      db.select({ id: pamPreArrivalChecklists.id }).from(pamPreArrivalChecklists)
        .where(and(eq(pamPreArrivalChecklists.tenantId, user.tenantId), isNull(pamPreArrivalChecklists.deletedAt), eq(pamPreArrivalChecklists.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pamPortAuthorityCommunications.id }).from(pamPortAuthorityCommunications)
        .where(and(eq(pamPortAuthorityCommunications.tenantId, user.tenantId), isNull(pamPortAuthorityCommunications.deletedAt), eq(pamPortAuthorityCommunications.status, "sent")))
        .then((r) => r.length),
      db.select({ id: pamCrewChangeCoordinations.id }).from(pamCrewChangeCoordinations)
        .where(and(eq(pamCrewChangeCoordinations.tenantId, user.tenantId), isNull(pamCrewChangeCoordinations.deletedAt), eq(pamCrewChangeCoordinations.status, "planned")))
        .then((r) => r.length),
      db.select({ id: pamCashToMasters.id }).from(pamCashToMasters)
        .where(and(eq(pamCashToMasters.tenantId, user.tenantId), isNull(pamCashToMasters.deletedAt), eq(pamCashToMasters.status, "requested")))
        .then((r) => r.length),
      db.select({ id: pamVesselClearances.id }).from(pamVesselClearances)
        .where(and(eq(pamVesselClearances.tenantId, user.tenantId), isNull(pamVesselClearances.deletedAt), eq(pamVesselClearances.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pamDisbursementAccounts.id }).from(pamDisbursementAccounts)
        .where(and(eq(pamDisbursementAccounts.tenantId, user.tenantId), isNull(pamDisbursementAccounts.deletedAt), eq(pamDisbursementAccounts.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        plannedPortCalls,
        pendingServices,
        pendingChecklists,
        activeCommunications,
        plannedCrewChanges,
        pendingCash,
        pendingClearances,
        draftDisbursements,
      },
    });
  } catch (error) {
    console.error("Failed to get port agency hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
