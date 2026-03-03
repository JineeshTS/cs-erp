import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pttTerminalHandlingCharges,
  pttPortDuesWharfages,
  pttPilotageTowageCharges,
  pttStorageDemurrageTariffs,
  pttTariffComparisons,
  pttInvoiceValidations,
  pttCostOptimizations,
  pttBudgetPlannings,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ptt:read")))
      return forbiddenResponse();

    const [
      draftTerminalHandlingCharges,
      draftPortDuesWharfages,
      draftPilotageTowageCharges,
      draftStorageDemurrageTariffs,
      draftTariffComparisons,
      draftInvoiceValidations,
      draftCostOptimizations,
      draftBudgetPlannings,
    ] = await Promise.all([
      db.select({ id: pttTerminalHandlingCharges.id }).from(pttTerminalHandlingCharges)
        .where(and(eq(pttTerminalHandlingCharges.tenantId, user.tenantId), isNull(pttTerminalHandlingCharges.deletedAt), eq(pttTerminalHandlingCharges.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttPortDuesWharfages.id }).from(pttPortDuesWharfages)
        .where(and(eq(pttPortDuesWharfages.tenantId, user.tenantId), isNull(pttPortDuesWharfages.deletedAt), eq(pttPortDuesWharfages.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttPilotageTowageCharges.id }).from(pttPilotageTowageCharges)
        .where(and(eq(pttPilotageTowageCharges.tenantId, user.tenantId), isNull(pttPilotageTowageCharges.deletedAt), eq(pttPilotageTowageCharges.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttStorageDemurrageTariffs.id }).from(pttStorageDemurrageTariffs)
        .where(and(eq(pttStorageDemurrageTariffs.tenantId, user.tenantId), isNull(pttStorageDemurrageTariffs.deletedAt), eq(pttStorageDemurrageTariffs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttTariffComparisons.id }).from(pttTariffComparisons)
        .where(and(eq(pttTariffComparisons.tenantId, user.tenantId), isNull(pttTariffComparisons.deletedAt), eq(pttTariffComparisons.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttInvoiceValidations.id }).from(pttInvoiceValidations)
        .where(and(eq(pttInvoiceValidations.tenantId, user.tenantId), isNull(pttInvoiceValidations.deletedAt), eq(pttInvoiceValidations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttCostOptimizations.id }).from(pttCostOptimizations)
        .where(and(eq(pttCostOptimizations.tenantId, user.tenantId), isNull(pttCostOptimizations.deletedAt), eq(pttCostOptimizations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pttBudgetPlannings.id }).from(pttBudgetPlannings)
        .where(and(eq(pttBudgetPlannings.tenantId, user.tenantId), isNull(pttBudgetPlannings.deletedAt), eq(pttBudgetPlannings.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftTerminalHandlingCharges,
        draftPortDuesWharfages,
        draftPilotageTowageCharges,
        draftStorageDemurrageTariffs,
        draftTariffComparisons,
        draftInvoiceValidations,
        draftCostOptimizations,
        draftBudgetPlannings,
      },
    });
  } catch (error) {
    console.error("Failed to get PTT hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
