import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cpmTariffs,
  cpmSpecialRates,
  cpmSurcharges,
  cpmDetentionDemurrage,
  cpmYieldTargets,
  cpmRateBenchmarks,
  cpmProfitabilityAnalyses,
  cpmAiPricingModels,
  cpmVsaSlotRates,
  cpmDeadFreightRecords,
  cpmRevenueLeakages,
  cpmPricingApprovals,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "commercial:read"))) return forbiddenResponse();

    const [
      [tariffsResult],
      [specialRatesResult],
      [surchargesResult],
      [ddResult],
      [yieldResult],
      [benchmarksResult],
      [profitResult],
      [aiResult],
      [vsaResult],
      [deadFreightResult],
      [leakagesResult],
      [approvalsResult],
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(cpmTariffs)
        .where(
          and(
            eq(cpmTariffs.tenantId, user.tenantId),
            isNull(cpmTariffs.deletedAt),
            eq(cpmTariffs.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmSpecialRates)
        .where(
          and(
            eq(cpmSpecialRates.tenantId, user.tenantId),
            isNull(cpmSpecialRates.deletedAt),
            eq(cpmSpecialRates.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmSurcharges)
        .where(
          and(
            eq(cpmSurcharges.tenantId, user.tenantId),
            isNull(cpmSurcharges.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(cpmDetentionDemurrage)
        .where(
          and(
            eq(cpmDetentionDemurrage.tenantId, user.tenantId),
            isNull(cpmDetentionDemurrage.deletedAt),
            eq(cpmDetentionDemurrage.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmYieldTargets)
        .where(
          and(
            eq(cpmYieldTargets.tenantId, user.tenantId),
            isNull(cpmYieldTargets.deletedAt),
            eq(cpmYieldTargets.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmRateBenchmarks)
        .where(
          and(
            eq(cpmRateBenchmarks.tenantId, user.tenantId),
            isNull(cpmRateBenchmarks.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(cpmProfitabilityAnalyses)
        .where(
          and(
            eq(cpmProfitabilityAnalyses.tenantId, user.tenantId),
            isNull(cpmProfitabilityAnalyses.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(cpmAiPricingModels)
        .where(
          and(
            eq(cpmAiPricingModels.tenantId, user.tenantId),
            isNull(cpmAiPricingModels.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(cpmVsaSlotRates)
        .where(
          and(
            eq(cpmVsaSlotRates.tenantId, user.tenantId),
            isNull(cpmVsaSlotRates.deletedAt),
            eq(cpmVsaSlotRates.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmDeadFreightRecords)
        .where(
          and(
            eq(cpmDeadFreightRecords.tenantId, user.tenantId),
            isNull(cpmDeadFreightRecords.deletedAt)
          )
        ),
      db
        .select({ count: count() })
        .from(cpmRevenueLeakages)
        .where(
          and(
            eq(cpmRevenueLeakages.tenantId, user.tenantId),
            isNull(cpmRevenueLeakages.deletedAt),
            eq(cpmRevenueLeakages.status, "detected")
          )
        ),
      db
        .select({ count: count() })
        .from(cpmPricingApprovals)
        .where(
          and(
            eq(cpmPricingApprovals.tenantId, user.tenantId),
            isNull(cpmPricingApprovals.deletedAt),
            eq(cpmPricingApprovals.status, "pending")
          )
        ),
    ]);

    return NextResponse.json({
      data: {
        activeTariffs: tariffsResult.count,
        activeSpecialRates: specialRatesResult.count,
        totalSurcharges: surchargesResult.count,
        activeDetentionDemurrage: ddResult.count,
        activeYieldTargets: yieldResult.count,
        totalBenchmarks: benchmarksResult.count,
        totalAnalyses: profitResult.count,
        totalAiModels: aiResult.count,
        activeVsaSlotRates: vsaResult.count,
        totalDeadFreight: deadFreightResult.count,
        detectedLeakages: leakagesResult.count,
        pendingApprovals: approvalsResult.count,
      },
    });
  } catch (error) {
    console.error("Failed to get commercial-pricing-management summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
