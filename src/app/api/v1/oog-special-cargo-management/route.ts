import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  oogCargoAcceptances,
  oogStowagePlans,
  oogSpecialEquipment,
  oogHeavyLifts,
  oogPortApprovals,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:read")))
      return forbiddenResponse();

    const [
      pendingAcceptances,
      draftStowagePlans,
      availableEquipment,
      planningHeavyLifts,
      pendingApprovals,
    ] = await Promise.all([
      db.select({ id: oogCargoAcceptances.id }).from(oogCargoAcceptances)
        .where(and(eq(oogCargoAcceptances.tenantId, user.tenantId), isNull(oogCargoAcceptances.deletedAt), eq(oogCargoAcceptances.status, "pending")))
        .then((r) => r.length),
      db.select({ id: oogStowagePlans.id }).from(oogStowagePlans)
        .where(and(eq(oogStowagePlans.tenantId, user.tenantId), isNull(oogStowagePlans.deletedAt), eq(oogStowagePlans.status, "draft")))
        .then((r) => r.length),
      db.select({ id: oogSpecialEquipment.id }).from(oogSpecialEquipment)
        .where(and(eq(oogSpecialEquipment.tenantId, user.tenantId), isNull(oogSpecialEquipment.deletedAt), eq(oogSpecialEquipment.status, "available")))
        .then((r) => r.length),
      db.select({ id: oogHeavyLifts.id }).from(oogHeavyLifts)
        .where(and(eq(oogHeavyLifts.tenantId, user.tenantId), isNull(oogHeavyLifts.deletedAt), eq(oogHeavyLifts.status, "planning")))
        .then((r) => r.length),
      db.select({ id: oogPortApprovals.id }).from(oogPortApprovals)
        .where(and(eq(oogPortApprovals.tenantId, user.tenantId), isNull(oogPortApprovals.deletedAt), eq(oogPortApprovals.status, "pending")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        pendingAcceptances,
        draftStowagePlans,
        availableEquipment,
        planningHeavyLifts,
        pendingApprovals,
      },
    });
  } catch (error) {
    console.error("Failed to get OOG special cargo hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
