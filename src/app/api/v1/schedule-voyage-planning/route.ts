import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  svpServiceSchedules,
  svpPortSequences,
  svpCanalTransits,
  svpEtaManagements,
  svpVoyageOptimizations,
  svpSpeedFuelAnalyses,
  svpWeatherRoutings,
  svpDeploymentPlans,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "svp:read")))
      return forbiddenResponse();

    const [
      draftServiceSchedules,
      draftPortSequences,
      draftCanalTransits,
      draftEtaManagements,
      draftVoyageOptimizations,
      draftSpeedFuelAnalyses,
      draftWeatherRoutings,
      draftDeploymentPlans,
    ] = await Promise.all([
      db.select({ id: svpServiceSchedules.id }).from(svpServiceSchedules)
        .where(and(eq(svpServiceSchedules.tenantId, user.tenantId), isNull(svpServiceSchedules.deletedAt), eq(svpServiceSchedules.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpPortSequences.id }).from(svpPortSequences)
        .where(and(eq(svpPortSequences.tenantId, user.tenantId), isNull(svpPortSequences.deletedAt), eq(svpPortSequences.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpCanalTransits.id }).from(svpCanalTransits)
        .where(and(eq(svpCanalTransits.tenantId, user.tenantId), isNull(svpCanalTransits.deletedAt), eq(svpCanalTransits.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpEtaManagements.id }).from(svpEtaManagements)
        .where(and(eq(svpEtaManagements.tenantId, user.tenantId), isNull(svpEtaManagements.deletedAt), eq(svpEtaManagements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpVoyageOptimizations.id }).from(svpVoyageOptimizations)
        .where(and(eq(svpVoyageOptimizations.tenantId, user.tenantId), isNull(svpVoyageOptimizations.deletedAt), eq(svpVoyageOptimizations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpSpeedFuelAnalyses.id }).from(svpSpeedFuelAnalyses)
        .where(and(eq(svpSpeedFuelAnalyses.tenantId, user.tenantId), isNull(svpSpeedFuelAnalyses.deletedAt), eq(svpSpeedFuelAnalyses.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpWeatherRoutings.id }).from(svpWeatherRoutings)
        .where(and(eq(svpWeatherRoutings.tenantId, user.tenantId), isNull(svpWeatherRoutings.deletedAt), eq(svpWeatherRoutings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpDeploymentPlans.id }).from(svpDeploymentPlans)
        .where(and(eq(svpDeploymentPlans.tenantId, user.tenantId), isNull(svpDeploymentPlans.deletedAt), eq(svpDeploymentPlans.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftServiceSchedules,
        draftPortSequences,
        draftCanalTransits,
        draftEtaManagements,
        draftVoyageOptimizations,
        draftSpeedFuelAnalyses,
        draftWeatherRoutings,
        draftDeploymentPlans,
      },
    });
  } catch (error) {
    console.error("Failed to get Schedule & Voyage Planning hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
