import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ddmDemurrageCalculations,
  ddmDetentionTrackings,
  ddmInvoices,
  ddmDisputes,
  ddmPredictions,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "demurrage:read")))
      return forbiddenResponse();

    const [
      pendingDemurrage,
      activeDetentions,
      unpaidInvoices,
      openDisputes,
      highRiskPredictions,
    ] = await Promise.all([
      db.select({ id: ddmDemurrageCalculations.id }).from(ddmDemurrageCalculations)
        .where(and(eq(ddmDemurrageCalculations.tenantId, user.tenantId), isNull(ddmDemurrageCalculations.deletedAt), eq(ddmDemurrageCalculations.status, "pending")))
        .then((r) => r.length),
      db.select({ id: ddmDetentionTrackings.id }).from(ddmDetentionTrackings)
        .where(and(eq(ddmDetentionTrackings.tenantId, user.tenantId), isNull(ddmDetentionTrackings.deletedAt), eq(ddmDetentionTrackings.status, "active")))
        .then((r) => r.length),
      db.select({ id: ddmInvoices.id }).from(ddmInvoices)
        .where(and(eq(ddmInvoices.tenantId, user.tenantId), isNull(ddmInvoices.deletedAt), eq(ddmInvoices.status, "sent")))
        .then((r) => r.length),
      db.select({ id: ddmDisputes.id }).from(ddmDisputes)
        .where(and(eq(ddmDisputes.tenantId, user.tenantId), isNull(ddmDisputes.deletedAt), eq(ddmDisputes.status, "open")))
        .then((r) => r.length),
      db.select({ id: ddmPredictions.id }).from(ddmPredictions)
        .where(and(eq(ddmPredictions.tenantId, user.tenantId), isNull(ddmPredictions.deletedAt), eq(ddmPredictions.riskLevel, "high")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        pendingDemurrage,
        activeDetentions,
        unpaidInvoices,
        openDisputes,
        highRiskPredictions,
      },
    });
  } catch (error) {
    console.error("Failed to get demurrage detention hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
