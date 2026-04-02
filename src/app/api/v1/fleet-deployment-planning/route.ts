import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  fdpDeploymentDecisions,
  fdpFleetUtilizations,
  fdpNetworkDesigns,
  fdpDeploymentOptimizers,
  fdpFleetFinancials,
  fdpVesselSwaps,
  fdpDeploymentContracts,
  fdpMarketIntelligence,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "fdp:read")))
      return forbiddenResponse();

    const [
      draftDeploymentDecisions,
      draftFleetUtilizations,
      draftNetworkDesigns,
      draftDeploymentOptimizers,
      draftFleetFinancials,
      draftVesselSwaps,
      draftDeploymentContracts,
      draftMarketIntelligence,
    ] = await Promise.all([
      db.select({ value: count() }).from(fdpDeploymentDecisions)
        .where(and(eq(fdpDeploymentDecisions.tenantId, user.tenantId), isNull(fdpDeploymentDecisions.deletedAt), eq(fdpDeploymentDecisions.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpFleetUtilizations)
        .where(and(eq(fdpFleetUtilizations.tenantId, user.tenantId), isNull(fdpFleetUtilizations.deletedAt), eq(fdpFleetUtilizations.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpNetworkDesigns)
        .where(and(eq(fdpNetworkDesigns.tenantId, user.tenantId), isNull(fdpNetworkDesigns.deletedAt), eq(fdpNetworkDesigns.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpDeploymentOptimizers)
        .where(and(eq(fdpDeploymentOptimizers.tenantId, user.tenantId), isNull(fdpDeploymentOptimizers.deletedAt), eq(fdpDeploymentOptimizers.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpFleetFinancials)
        .where(and(eq(fdpFleetFinancials.tenantId, user.tenantId), isNull(fdpFleetFinancials.deletedAt), eq(fdpFleetFinancials.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpVesselSwaps)
        .where(and(eq(fdpVesselSwaps.tenantId, user.tenantId), isNull(fdpVesselSwaps.deletedAt), eq(fdpVesselSwaps.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpDeploymentContracts)
        .where(and(eq(fdpDeploymentContracts.tenantId, user.tenantId), isNull(fdpDeploymentContracts.deletedAt), eq(fdpDeploymentContracts.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(fdpMarketIntelligence)
        .where(and(eq(fdpMarketIntelligence.tenantId, user.tenantId), isNull(fdpMarketIntelligence.deletedAt), eq(fdpMarketIntelligence.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        draftDeploymentDecisions,
        draftFleetUtilizations,
        draftNetworkDesigns,
        draftDeploymentOptimizers,
        draftFleetFinancials,
        draftVesselSwaps,
        draftDeploymentContracts,
        draftMarketIntelligence,
      },
    });
  } catch (error) {
    console.error("Failed to get Fleet Deployment Planning hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
