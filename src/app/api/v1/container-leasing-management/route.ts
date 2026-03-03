import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clmLeaseAgreements,
  clmOnhireOffhires,
  clmMnrDamageBillings,
  clmLeaseCostAllocations,
  clmLessorReconciliations,
  clmContainerRedeliveries,
  clmLeaseVsBuyAnalyses,
  clmFleetOptimizers,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "clm:read")))
      return forbiddenResponse();

    const [
      draftLeaseAgreements,
      draftOnhireOffhires,
      draftMnrDamageBillings,
      draftLeaseCostAllocations,
      draftLessorReconciliations,
      draftContainerRedeliveries,
      draftLeaseVsBuyAnalyses,
      draftFleetOptimizers,
    ] = await Promise.all([
      db.select({ id: clmLeaseAgreements.id }).from(clmLeaseAgreements)
        .where(and(eq(clmLeaseAgreements.tenantId, user.tenantId), isNull(clmLeaseAgreements.deletedAt), eq(clmLeaseAgreements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmOnhireOffhires.id }).from(clmOnhireOffhires)
        .where(and(eq(clmOnhireOffhires.tenantId, user.tenantId), isNull(clmOnhireOffhires.deletedAt), eq(clmOnhireOffhires.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmMnrDamageBillings.id }).from(clmMnrDamageBillings)
        .where(and(eq(clmMnrDamageBillings.tenantId, user.tenantId), isNull(clmMnrDamageBillings.deletedAt), eq(clmMnrDamageBillings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLeaseCostAllocations.id }).from(clmLeaseCostAllocations)
        .where(and(eq(clmLeaseCostAllocations.tenantId, user.tenantId), isNull(clmLeaseCostAllocations.deletedAt), eq(clmLeaseCostAllocations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLessorReconciliations.id }).from(clmLessorReconciliations)
        .where(and(eq(clmLessorReconciliations.tenantId, user.tenantId), isNull(clmLessorReconciliations.deletedAt), eq(clmLessorReconciliations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmContainerRedeliveries.id }).from(clmContainerRedeliveries)
        .where(and(eq(clmContainerRedeliveries.tenantId, user.tenantId), isNull(clmContainerRedeliveries.deletedAt), eq(clmContainerRedeliveries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLeaseVsBuyAnalyses.id }).from(clmLeaseVsBuyAnalyses)
        .where(and(eq(clmLeaseVsBuyAnalyses.tenantId, user.tenantId), isNull(clmLeaseVsBuyAnalyses.deletedAt), eq(clmLeaseVsBuyAnalyses.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmFleetOptimizers.id }).from(clmFleetOptimizers)
        .where(and(eq(clmFleetOptimizers.tenantId, user.tenantId), isNull(clmFleetOptimizers.deletedAt), eq(clmFleetOptimizers.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftLeaseAgreements,
        draftOnhireOffhires,
        draftMnrDamageBillings,
        draftLeaseCostAllocations,
        draftLessorReconciliations,
        draftContainerRedeliveries,
        draftLeaseVsBuyAnalyses,
        draftFleetOptimizers,
      },
    });
  } catch (error) {
    console.error("Failed to get CLM hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
