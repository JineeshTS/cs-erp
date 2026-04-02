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
import { eq, and, isNull, count } from "drizzle-orm";

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
      db.select({ value: count() }).from(vpeSpeedConsumptions)
        .where(and(eq(vpeSpeedConsumptions.tenantId, user.tenantId), isNull(vpeSpeedConsumptions.deletedAt), eq(vpeSpeedConsumptions.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeCiiRatings)
        .where(and(eq(vpeCiiRatings.tenantId, user.tenantId), isNull(vpeCiiRatings.deletedAt), eq(vpeCiiRatings.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeEexiCompliances)
        .where(and(eq(vpeEexiCompliances.tenantId, user.tenantId), isNull(vpeEexiCompliances.deletedAt), eq(vpeEexiCompliances.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeNoonReports)
        .where(and(eq(vpeNoonReports.tenantId, user.tenantId), isNull(vpeNoonReports.deletedAt), eq(vpeNoonReports.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeVoyagePerformances)
        .where(and(eq(vpeVoyagePerformances.tenantId, user.tenantId), isNull(vpeVoyagePerformances.deletedAt), eq(vpeVoyagePerformances.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeWeatherRoutings)
        .where(and(eq(vpeWeatherRoutings.tenantId, user.tenantId), isNull(vpeWeatherRoutings.deletedAt), eq(vpeWeatherRoutings.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeCarbonEmissions)
        .where(and(eq(vpeCarbonEmissions.tenantId, user.tenantId), isNull(vpeCarbonEmissions.deletedAt), eq(vpeCarbonEmissions.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vpeFuelBenchmarks)
        .where(and(eq(vpeFuelBenchmarks.tenantId, user.tenantId), isNull(vpeFuelBenchmarks.deletedAt), eq(vpeFuelBenchmarks.status, "draft")))
        .then(([r]) => r.value),
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
