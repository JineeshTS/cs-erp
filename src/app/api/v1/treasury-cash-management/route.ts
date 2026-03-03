import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tcmBankAccounts,
  tcmCashPositions,
  tcmBankReconciliations,
  tcmCashPoolingSweeps,
  tcmFxHedgingExposures,
  tcmLettersOfCredit,
  tcmBankGuarantees,
  tcmIntercompanyLoans,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:read")))
      return forbiddenResponse();

    const [
      activeBankAccounts,
      draftCashPositions,
      draftReconciliations,
      activeSweeps,
      activeHedges,
      draftLCs,
      draftBGs,
      activeLoans,
    ] = await Promise.all([
      db.select({ id: tcmBankAccounts.id }).from(tcmBankAccounts)
        .where(and(eq(tcmBankAccounts.tenantId, user.tenantId), isNull(tcmBankAccounts.deletedAt), eq(tcmBankAccounts.status, "active")))
        .then((r) => r.length),
      db.select({ id: tcmCashPositions.id }).from(tcmCashPositions)
        .where(and(eq(tcmCashPositions.tenantId, user.tenantId), isNull(tcmCashPositions.deletedAt), eq(tcmCashPositions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: tcmBankReconciliations.id }).from(tcmBankReconciliations)
        .where(and(eq(tcmBankReconciliations.tenantId, user.tenantId), isNull(tcmBankReconciliations.deletedAt), eq(tcmBankReconciliations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: tcmCashPoolingSweeps.id }).from(tcmCashPoolingSweeps)
        .where(and(eq(tcmCashPoolingSweeps.tenantId, user.tenantId), isNull(tcmCashPoolingSweeps.deletedAt), eq(tcmCashPoolingSweeps.status, "active")))
        .then((r) => r.length),
      db.select({ id: tcmFxHedgingExposures.id }).from(tcmFxHedgingExposures)
        .where(and(eq(tcmFxHedgingExposures.tenantId, user.tenantId), isNull(tcmFxHedgingExposures.deletedAt), eq(tcmFxHedgingExposures.status, "active")))
        .then((r) => r.length),
      db.select({ id: tcmLettersOfCredit.id }).from(tcmLettersOfCredit)
        .where(and(eq(tcmLettersOfCredit.tenantId, user.tenantId), isNull(tcmLettersOfCredit.deletedAt), eq(tcmLettersOfCredit.status, "draft")))
        .then((r) => r.length),
      db.select({ id: tcmBankGuarantees.id }).from(tcmBankGuarantees)
        .where(and(eq(tcmBankGuarantees.tenantId, user.tenantId), isNull(tcmBankGuarantees.deletedAt), eq(tcmBankGuarantees.status, "draft")))
        .then((r) => r.length),
      db.select({ id: tcmIntercompanyLoans.id }).from(tcmIntercompanyLoans)
        .where(and(eq(tcmIntercompanyLoans.tenantId, user.tenantId), isNull(tcmIntercompanyLoans.deletedAt), eq(tcmIntercompanyLoans.status, "active")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeBankAccounts,
        draftCashPositions,
        draftReconciliations,
        activeSweeps,
        activeHedges,
        draftLCs,
        draftBGs,
        activeLoans,
      },
    });
  } catch (error) {
    console.error("Failed to get treasury hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
