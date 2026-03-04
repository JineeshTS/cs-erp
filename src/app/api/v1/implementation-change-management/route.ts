import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  icmProjectPlans,
  icmDataMigrations,
  icmUatManagements,
  icmGoLiveChecklists,
  icmChangeRequests,
  icmSystemConfigs,
  icmTrainingCompletions,
  icmHypercareSupports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "icm:read")))
      return forbiddenResponse();

    const [
      draftProjectPlans,
      draftDataMigrations,
      draftUatManagements,
      draftGoLiveChecklists,
      draftChangeRequests,
      draftSystemConfigs,
      draftTrainingCompletions,
      draftHypercareSupports,
    ] = await Promise.all([
      db.select({ id: icmProjectPlans.id }).from(icmProjectPlans)
        .where(and(eq(icmProjectPlans.tenantId, user.tenantId), isNull(icmProjectPlans.deletedAt), eq(icmProjectPlans.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmDataMigrations.id }).from(icmDataMigrations)
        .where(and(eq(icmDataMigrations.tenantId, user.tenantId), isNull(icmDataMigrations.deletedAt), eq(icmDataMigrations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmUatManagements.id }).from(icmUatManagements)
        .where(and(eq(icmUatManagements.tenantId, user.tenantId), isNull(icmUatManagements.deletedAt), eq(icmUatManagements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmGoLiveChecklists.id }).from(icmGoLiveChecklists)
        .where(and(eq(icmGoLiveChecklists.tenantId, user.tenantId), isNull(icmGoLiveChecklists.deletedAt), eq(icmGoLiveChecklists.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmChangeRequests.id }).from(icmChangeRequests)
        .where(and(eq(icmChangeRequests.tenantId, user.tenantId), isNull(icmChangeRequests.deletedAt), eq(icmChangeRequests.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmSystemConfigs.id }).from(icmSystemConfigs)
        .where(and(eq(icmSystemConfigs.tenantId, user.tenantId), isNull(icmSystemConfigs.deletedAt), eq(icmSystemConfigs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmTrainingCompletions.id }).from(icmTrainingCompletions)
        .where(and(eq(icmTrainingCompletions.tenantId, user.tenantId), isNull(icmTrainingCompletions.deletedAt), eq(icmTrainingCompletions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: icmHypercareSupports.id }).from(icmHypercareSupports)
        .where(and(eq(icmHypercareSupports.tenantId, user.tenantId), isNull(icmHypercareSupports.deletedAt), eq(icmHypercareSupports.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftProjectPlans,
        draftDataMigrations,
        draftUatManagements,
        draftGoLiveChecklists,
        draftChangeRequests,
        draftSystemConfigs,
        draftTrainingCompletions,
        draftHypercareSupports,
      },
    });
  } catch (error) {
    console.error("Failed to get Implementation & Change Management hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
