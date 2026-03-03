import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  vpeSpeedConsumptions,
  vpeCiiRatings,
  vpeEexiCompliances,
  vpeNoonReports,
  vpeVoyagePerformances,
  vpeWeatherRoutings,
  vpeCarbonEmissions,
  vpeFuelBenchmarks,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vpe:read")))
      return forbiddenResponse();

    const [
      draftSpeedConsumptions,
      draftCiiRatings,
      draftEexiCompliances,
      draftNoonReports,
      draftVoyagePerformances,
      draftWeatherRoutings,
      draftCarbonEmissions,
      draftFuelBenchmarks,
    ] = await Promise.all([
      db.select({ id: vpeSpeedConsumptions.id }).from(vpeSpeedConsumptions)
        .where(and(eq(vpeSpeedConsumptions.tenantId, user.tenantId), isNull(vpeSpeedConsumptions.deletedAt), eq(vpeSpeedConsumptions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeCiiRatings.id }).from(vpeCiiRatings)
        .where(and(eq(vpeCiiRatings.tenantId, user.tenantId), isNull(vpeCiiRatings.deletedAt), eq(vpeCiiRatings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeEexiCompliances.id }).from(vpeEexiCompliances)
        .where(and(eq(vpeEexiCompliances.tenantId, user.tenantId), isNull(vpeEexiCompliances.deletedAt), eq(vpeEexiCompliances.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeNoonReports.id }).from(vpeNoonReports)
        .where(and(eq(vpeNoonReports.tenantId, user.tenantId), isNull(vpeNoonReports.deletedAt), eq(vpeNoonReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeVoyagePerformances.id }).from(vpeVoyagePerformances)
        .where(and(eq(vpeVoyagePerformances.tenantId, user.tenantId), isNull(vpeVoyagePerformances.deletedAt), eq(vpeVoyagePerformances.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeWeatherRoutings.id }).from(vpeWeatherRoutings)
        .where(and(eq(vpeWeatherRoutings.tenantId, user.tenantId), isNull(vpeWeatherRoutings.deletedAt), eq(vpeWeatherRoutings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeCarbonEmissions.id }).from(vpeCarbonEmissions)
        .where(and(eq(vpeCarbonEmissions.tenantId, user.tenantId), isNull(vpeCarbonEmissions.deletedAt), eq(vpeCarbonEmissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeFuelBenchmarks.id }).from(vpeFuelBenchmarks)
        .where(and(eq(vpeFuelBenchmarks.tenantId, user.tenantId), isNull(vpeFuelBenchmarks.deletedAt), eq(vpeFuelBenchmarks.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftSpeedConsumptions,
        draftCiiRatings,
        draftEexiCompliances,
        draftNoonReports,
        draftVoyagePerformances,
        draftWeatherRoutings,
        draftCarbonEmissions,
        draftFuelBenchmarks,
      },
    });
  } catch (error) {
    console.error("Failed to get VPE hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
