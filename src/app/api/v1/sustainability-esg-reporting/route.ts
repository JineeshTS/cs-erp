import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  serCarbonFootprints,
  serGhgReports,
  serSeaCargoCharters,
  serPoseidonAlignments,
  serDecarbRoadmaps,
  serAltFuelTrackings,
  serEsgKpis,
  serTcfdReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ser:read")))
      return forbiddenResponse();

    const [
      draftCarbonFootprints,
      draftGhgReports,
      draftSeaCargoCharters,
      draftPoseidonAlignments,
      draftDecarbRoadmaps,
      draftAltFuelTrackings,
      draftEsgKpis,
      draftTcfdReports,
    ] = await Promise.all([
      db.select({ id: serCarbonFootprints.id }).from(serCarbonFootprints)
        .where(and(eq(serCarbonFootprints.tenantId, user.tenantId), isNull(serCarbonFootprints.deletedAt), eq(serCarbonFootprints.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serGhgReports.id }).from(serGhgReports)
        .where(and(eq(serGhgReports.tenantId, user.tenantId), isNull(serGhgReports.deletedAt), eq(serGhgReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serSeaCargoCharters.id }).from(serSeaCargoCharters)
        .where(and(eq(serSeaCargoCharters.tenantId, user.tenantId), isNull(serSeaCargoCharters.deletedAt), eq(serSeaCargoCharters.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serPoseidonAlignments.id }).from(serPoseidonAlignments)
        .where(and(eq(serPoseidonAlignments.tenantId, user.tenantId), isNull(serPoseidonAlignments.deletedAt), eq(serPoseidonAlignments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serDecarbRoadmaps.id }).from(serDecarbRoadmaps)
        .where(and(eq(serDecarbRoadmaps.tenantId, user.tenantId), isNull(serDecarbRoadmaps.deletedAt), eq(serDecarbRoadmaps.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serAltFuelTrackings.id }).from(serAltFuelTrackings)
        .where(and(eq(serAltFuelTrackings.tenantId, user.tenantId), isNull(serAltFuelTrackings.deletedAt), eq(serAltFuelTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serEsgKpis.id }).from(serEsgKpis)
        .where(and(eq(serEsgKpis.tenantId, user.tenantId), isNull(serEsgKpis.deletedAt), eq(serEsgKpis.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serTcfdReports.id }).from(serTcfdReports)
        .where(and(eq(serTcfdReports.tenantId, user.tenantId), isNull(serTcfdReports.deletedAt), eq(serTcfdReports.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftCarbonFootprints,
        draftGhgReports,
        draftSeaCargoCharters,
        draftPoseidonAlignments,
        draftDecarbRoadmaps,
        draftAltFuelTrackings,
        draftEsgKpis,
        draftTcfdReports,
      },
    });
  } catch (error) {
    console.error("Failed to get SER hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
