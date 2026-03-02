import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ltrServiceLoops,
  ltrPortPairTradeLanes,
  ltrSlotAgreements,
  ltrAllianceAgreements,
  ltrRouteOptimizations,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "liner:read")))
      return forbiddenResponse();

    const [
      activeLoops,
      activeTradeLanes,
      activeSlotAgreements,
      activeAlliances,
      pendingOptimizations,
    ] = await Promise.all([
      db.select({ id: ltrServiceLoops.id }).from(ltrServiceLoops)
        .where(and(eq(ltrServiceLoops.tenantId, user.tenantId), isNull(ltrServiceLoops.deletedAt), eq(ltrServiceLoops.status, "active")))
        .then((r) => r.length),
      db.select({ id: ltrPortPairTradeLanes.id }).from(ltrPortPairTradeLanes)
        .where(and(eq(ltrPortPairTradeLanes.tenantId, user.tenantId), isNull(ltrPortPairTradeLanes.deletedAt), eq(ltrPortPairTradeLanes.status, "active")))
        .then((r) => r.length),
      db.select({ id: ltrSlotAgreements.id }).from(ltrSlotAgreements)
        .where(and(eq(ltrSlotAgreements.tenantId, user.tenantId), isNull(ltrSlotAgreements.deletedAt), eq(ltrSlotAgreements.status, "active")))
        .then((r) => r.length),
      db.select({ id: ltrAllianceAgreements.id }).from(ltrAllianceAgreements)
        .where(and(eq(ltrAllianceAgreements.tenantId, user.tenantId), isNull(ltrAllianceAgreements.deletedAt), eq(ltrAllianceAgreements.status, "active")))
        .then((r) => r.length),
      db.select({ id: ltrRouteOptimizations.id }).from(ltrRouteOptimizations)
        .where(and(eq(ltrRouteOptimizations.tenantId, user.tenantId), isNull(ltrRouteOptimizations.deletedAt), eq(ltrRouteOptimizations.status, "pending")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeLoops,
        activeTradeLanes,
        activeSlotAgreements,
        activeAlliances,
        pendingOptimizations,
      },
    });
  } catch (error) {
    console.error("Failed to get liner trade route hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
