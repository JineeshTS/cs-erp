import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  simCargoSurveys,
  simContainerSurveys,
  simDraftSurveys,
  simHireSurveys,
  simHatchInspections,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "survey:read")))
      return forbiddenResponse();

    const [
      scheduledCargoSurveys,
      scheduledContainerSurveys,
      scheduledDraftSurveys,
      scheduledHireSurveys,
      scheduledHatchInspections,
    ] = await Promise.all([
      db.select({ id: simCargoSurveys.id }).from(simCargoSurveys)
        .where(and(eq(simCargoSurveys.tenantId, user.tenantId), isNull(simCargoSurveys.deletedAt), eq(simCargoSurveys.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: simContainerSurveys.id }).from(simContainerSurveys)
        .where(and(eq(simContainerSurveys.tenantId, user.tenantId), isNull(simContainerSurveys.deletedAt), eq(simContainerSurveys.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: simDraftSurveys.id }).from(simDraftSurveys)
        .where(and(eq(simDraftSurveys.tenantId, user.tenantId), isNull(simDraftSurveys.deletedAt), eq(simDraftSurveys.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: simHireSurveys.id }).from(simHireSurveys)
        .where(and(eq(simHireSurveys.tenantId, user.tenantId), isNull(simHireSurveys.deletedAt), eq(simHireSurveys.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: simHatchInspections.id }).from(simHatchInspections)
        .where(and(eq(simHatchInspections.tenantId, user.tenantId), isNull(simHatchInspections.deletedAt), eq(simHatchInspections.status, "scheduled")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        scheduledCargoSurveys,
        scheduledContainerSurveys,
        scheduledDraftSurveys,
        scheduledHireSurveys,
        scheduledHatchInspections,
      },
    });
  } catch (error) {
    console.error("Failed to get survey inspection hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
