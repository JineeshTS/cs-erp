import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { isfK8sClusters } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const clusters = await db.select().from(isfK8sClusters)
      .where(and(eq(isfK8sClusters.tenantId, user.tenantId), isNull(isfK8sClusters.deletedAt)));

    let totalNodes = 0;
    let totalCostPerHour = 0;
    const clusterSummaries = clusters.map((cluster) => {
      const nodeCount = cluster.nodeCount ?? 0;
      const costPerHour = cluster.costPerHour ?? 0;
      totalNodes += nodeCount;
      totalCostPerHour += costPerHour;
      return {
        clusterName: cluster.clusterName,
        nodeCount,
        costPerHour,
      };
    });

    return NextResponse.json({
      data: {
        totalClusters: clusters.length,
        totalNodes,
        totalCostPerHour,
        clusters: clusterSummaries,
      },
    });
  } catch (error) {
    console.error("Failed to generate cost report:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
