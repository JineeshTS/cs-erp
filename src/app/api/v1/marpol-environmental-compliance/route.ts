import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  mecAnnexCompliances, mecBallastWaters, mecAntiFoulings, mecWasteManagements,
  mecSulphurCaps, mecCiiRatings, mecCargoCharters, mecEnvironmentalIncidents,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:read"))) return forbiddenResponse();

    const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
      db.select({ id: mecAnnexCompliances.id }).from(mecAnnexCompliances).where(and(eq(mecAnnexCompliances.tenantId, user.tenantId), isNull(mecAnnexCompliances.deletedAt), eq(mecAnnexCompliances.status, "draft"))).then((r) => r.length),
      db.select({ id: mecBallastWaters.id }).from(mecBallastWaters).where(and(eq(mecBallastWaters.tenantId, user.tenantId), isNull(mecBallastWaters.deletedAt), eq(mecBallastWaters.status, "draft"))).then((r) => r.length),
      db.select({ id: mecAntiFoulings.id }).from(mecAntiFoulings).where(and(eq(mecAntiFoulings.tenantId, user.tenantId), isNull(mecAntiFoulings.deletedAt), eq(mecAntiFoulings.status, "draft"))).then((r) => r.length),
      db.select({ id: mecWasteManagements.id }).from(mecWasteManagements).where(and(eq(mecWasteManagements.tenantId, user.tenantId), isNull(mecWasteManagements.deletedAt), eq(mecWasteManagements.status, "draft"))).then((r) => r.length),
      db.select({ id: mecSulphurCaps.id }).from(mecSulphurCaps).where(and(eq(mecSulphurCaps.tenantId, user.tenantId), isNull(mecSulphurCaps.deletedAt), eq(mecSulphurCaps.status, "draft"))).then((r) => r.length),
      db.select({ id: mecCiiRatings.id }).from(mecCiiRatings).where(and(eq(mecCiiRatings.tenantId, user.tenantId), isNull(mecCiiRatings.deletedAt), eq(mecCiiRatings.status, "draft"))).then((r) => r.length),
      db.select({ id: mecCargoCharters.id }).from(mecCargoCharters).where(and(eq(mecCargoCharters.tenantId, user.tenantId), isNull(mecCargoCharters.deletedAt), eq(mecCargoCharters.status, "draft"))).then((r) => r.length),
      db.select({ id: mecEnvironmentalIncidents.id }).from(mecEnvironmentalIncidents).where(and(eq(mecEnvironmentalIncidents.tenantId, user.tenantId), isNull(mecEnvironmentalIncidents.deletedAt), eq(mecEnvironmentalIncidents.status, "draft"))).then((r) => r.length),
    ]);

    return NextResponse.json({
      data: { draftAnnexCompliances: d1, draftBallastWaters: d2, draftAntiFoulings: d3, draftWasteManagements: d4, draftSulphurCaps: d5, draftCiiRatings: d6, draftCargoCharters: d7, draftEnvironmentalIncidents: d8 },
    });
  } catch (error) {
    console.error("Failed to get MARPOL Environmental Compliance hub:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
