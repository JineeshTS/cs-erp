import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pdaProformaEstimates,
  pdaFinalDas,
  pdaPortCosts,
  pdaAgentStatements,
  pdaExpenseAllocations,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "disbursement:read")))
      return forbiddenResponse();

    const [
      draftProformas,
      pendingFinals,
      activeCosts,
      openStatements,
      pendingAllocations,
    ] = await Promise.all([
      db.select({ id: pdaProformaEstimates.id }).from(pdaProformaEstimates)
        .where(and(eq(pdaProformaEstimates.tenantId, user.tenantId), isNull(pdaProformaEstimates.deletedAt), eq(pdaProformaEstimates.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pdaFinalDas.id }).from(pdaFinalDas)
        .where(and(eq(pdaFinalDas.tenantId, user.tenantId), isNull(pdaFinalDas.deletedAt), eq(pdaFinalDas.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pdaPortCosts.id }).from(pdaPortCosts)
        .where(and(eq(pdaPortCosts.tenantId, user.tenantId), isNull(pdaPortCosts.deletedAt), eq(pdaPortCosts.status, "active")))
        .then((r) => r.length),
      db.select({ id: pdaAgentStatements.id }).from(pdaAgentStatements)
        .where(and(eq(pdaAgentStatements.tenantId, user.tenantId), isNull(pdaAgentStatements.deletedAt), eq(pdaAgentStatements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pdaExpenseAllocations.id }).from(pdaExpenseAllocations)
        .where(and(eq(pdaExpenseAllocations.tenantId, user.tenantId), isNull(pdaExpenseAllocations.deletedAt), eq(pdaExpenseAllocations.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftProformas,
        pendingFinals,
        activeCosts,
        openStatements,
        pendingAllocations,
      },
    });
  } catch (error) {
    console.error("Failed to get PDA hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
