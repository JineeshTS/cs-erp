import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  mecAnnexCompliances, mecBallastWaters, mecAntiFoulings, mecWasteManagements,
  mecSulphurCaps, mecCiiRatings, mecCargoCharters, mecEnvironmentalIncidents,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:read"))) return forbiddenResponse();

    const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
      db.select({ value: count() }).from(mecAnnexCompliances).where(and(eq(mecAnnexCompliances.tenantId, user.tenantId), isNull(mecAnnexCompliances.deletedAt), eq(mecAnnexCompliances.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecBallastWaters).where(and(eq(mecBallastWaters.tenantId, user.tenantId), isNull(mecBallastWaters.deletedAt), eq(mecBallastWaters.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecAntiFoulings).where(and(eq(mecAntiFoulings.tenantId, user.tenantId), isNull(mecAntiFoulings.deletedAt), eq(mecAntiFoulings.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecWasteManagements).where(and(eq(mecWasteManagements.tenantId, user.tenantId), isNull(mecWasteManagements.deletedAt), eq(mecWasteManagements.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecSulphurCaps).where(and(eq(mecSulphurCaps.tenantId, user.tenantId), isNull(mecSulphurCaps.deletedAt), eq(mecSulphurCaps.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecCiiRatings).where(and(eq(mecCiiRatings.tenantId, user.tenantId), isNull(mecCiiRatings.deletedAt), eq(mecCiiRatings.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecCargoCharters).where(and(eq(mecCargoCharters.tenantId, user.tenantId), isNull(mecCargoCharters.deletedAt), eq(mecCargoCharters.status, "draft"))).then(([r]) => r.value),
      db.select({ value: count() }).from(mecEnvironmentalIncidents).where(and(eq(mecEnvironmentalIncidents.tenantId, user.tenantId), isNull(mecEnvironmentalIncidents.deletedAt), eq(mecEnvironmentalIncidents.status, "draft"))).then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: { draftAnnexCompliances: d1, draftBallastWaters: d2, draftAntiFoulings: d3, draftWasteManagements: d4, draftSulphurCaps: d5, draftCiiRatings: d6, draftCargoCharters: d7, draftEnvironmentalIncidents: d8 },
    });
  } catch (error) {
    console.error("Failed to get MARPOL Environmental Compliance hub:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
