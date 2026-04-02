import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  dgmImdgCompliance,
  dgmBookingScreenings,
  dgmSegregationRules,
  dgmManifests,
  dgmIncidentReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:read")))
      return forbiddenResponse();

    const [
      activeCompliance,
      pendingScreenings,
      activeRules,
      draftManifests,
      openIncidents,
    ] = await Promise.all([
      db.select({ value: count() }).from(dgmImdgCompliance)
        .where(and(eq(dgmImdgCompliance.tenantId, user.tenantId), isNull(dgmImdgCompliance.deletedAt), eq(dgmImdgCompliance.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(dgmBookingScreenings)
        .where(and(eq(dgmBookingScreenings.tenantId, user.tenantId), isNull(dgmBookingScreenings.deletedAt), eq(dgmBookingScreenings.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(dgmSegregationRules)
        .where(and(eq(dgmSegregationRules.tenantId, user.tenantId), isNull(dgmSegregationRules.deletedAt), eq(dgmSegregationRules.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(dgmManifests)
        .where(and(eq(dgmManifests.tenantId, user.tenantId), isNull(dgmManifests.deletedAt), eq(dgmManifests.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(dgmIncidentReports)
        .where(and(eq(dgmIncidentReports.tenantId, user.tenantId), isNull(dgmIncidentReports.deletedAt), eq(dgmIncidentReports.status, "reported")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activeCompliance,
        pendingScreenings,
        activeRules,
        draftManifests,
        openIncidents,
      },
    });
  } catch (error) {
    console.error("Failed to get dangerous goods hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
