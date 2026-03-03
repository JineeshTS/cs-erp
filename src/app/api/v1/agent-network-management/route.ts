import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  anmGaAgreements,
  anmSubAgentConfigs,
  anmAgentCommissions,
  anmAgencyDocuments,
  anmPerformanceKpis,
  anmPortalConfigs,
  anmBookingAuthorities,
  anmAgentIncentives,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "anm:read")))
      return forbiddenResponse();

    const [
      draftGaAgreements,
      draftSubAgentConfigs,
      draftAgentCommissions,
      draftAgencyDocuments,
      draftPerformanceKpis,
      draftPortalConfigs,
      draftBookingAuthorities,
      draftAgentIncentives,
    ] = await Promise.all([
      db.select({ id: anmGaAgreements.id }).from(anmGaAgreements)
        .where(and(eq(anmGaAgreements.tenantId, user.tenantId), isNull(anmGaAgreements.deletedAt), eq(anmGaAgreements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmSubAgentConfigs.id }).from(anmSubAgentConfigs)
        .where(and(eq(anmSubAgentConfigs.tenantId, user.tenantId), isNull(anmSubAgentConfigs.deletedAt), eq(anmSubAgentConfigs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgentCommissions.id }).from(anmAgentCommissions)
        .where(and(eq(anmAgentCommissions.tenantId, user.tenantId), isNull(anmAgentCommissions.deletedAt), eq(anmAgentCommissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgencyDocuments.id }).from(anmAgencyDocuments)
        .where(and(eq(anmAgencyDocuments.tenantId, user.tenantId), isNull(anmAgencyDocuments.deletedAt), eq(anmAgencyDocuments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmPerformanceKpis.id }).from(anmPerformanceKpis)
        .where(and(eq(anmPerformanceKpis.tenantId, user.tenantId), isNull(anmPerformanceKpis.deletedAt), eq(anmPerformanceKpis.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmPortalConfigs.id }).from(anmPortalConfigs)
        .where(and(eq(anmPortalConfigs.tenantId, user.tenantId), isNull(anmPortalConfigs.deletedAt), eq(anmPortalConfigs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmBookingAuthorities.id }).from(anmBookingAuthorities)
        .where(and(eq(anmBookingAuthorities.tenantId, user.tenantId), isNull(anmBookingAuthorities.deletedAt), eq(anmBookingAuthorities.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgentIncentives.id }).from(anmAgentIncentives)
        .where(and(eq(anmAgentIncentives.tenantId, user.tenantId), isNull(anmAgentIncentives.deletedAt), eq(anmAgentIncentives.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftGaAgreements,
        draftSubAgentConfigs,
        draftAgentCommissions,
        draftAgencyDocuments,
        draftPerformanceKpis,
        draftPortalConfigs,
        draftBookingAuthorities,
        draftAgentIncentives,
      },
    });
  } catch (error) {
    console.error("Failed to get ANM hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
