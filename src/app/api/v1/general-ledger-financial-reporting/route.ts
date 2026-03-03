import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  glfrChartOfAccounts,
  glfrJournalEntries,
  glfrPeriodClosures,
  glfrFinancialStatements,
  glfrSegmentReports,
  glfrConsolidatedStatements,
  glfrBudgets,
  glfrVarianceAnalyses,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "gl:read")))
      return forbiddenResponse();

    const [
      activeAccounts,
      draftJournalEntries,
      openPeriods,
      draftStatements,
      draftSegmentReports,
      draftConsolidations,
      draftBudgets,
      draftVarianceAnalyses,
    ] = await Promise.all([
      db.select({ id: glfrChartOfAccounts.id }).from(glfrChartOfAccounts)
        .where(and(eq(glfrChartOfAccounts.tenantId, user.tenantId), isNull(glfrChartOfAccounts.deletedAt), eq(glfrChartOfAccounts.status, "active")))
        .then((r) => r.length),
      db.select({ id: glfrJournalEntries.id }).from(glfrJournalEntries)
        .where(and(eq(glfrJournalEntries.tenantId, user.tenantId), isNull(glfrJournalEntries.deletedAt), eq(glfrJournalEntries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrPeriodClosures.id }).from(glfrPeriodClosures)
        .where(and(eq(glfrPeriodClosures.tenantId, user.tenantId), isNull(glfrPeriodClosures.deletedAt), eq(glfrPeriodClosures.status, "open")))
        .then((r) => r.length),
      db.select({ id: glfrFinancialStatements.id }).from(glfrFinancialStatements)
        .where(and(eq(glfrFinancialStatements.tenantId, user.tenantId), isNull(glfrFinancialStatements.deletedAt), eq(glfrFinancialStatements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrSegmentReports.id }).from(glfrSegmentReports)
        .where(and(eq(glfrSegmentReports.tenantId, user.tenantId), isNull(glfrSegmentReports.deletedAt), eq(glfrSegmentReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrConsolidatedStatements.id }).from(glfrConsolidatedStatements)
        .where(and(eq(glfrConsolidatedStatements.tenantId, user.tenantId), isNull(glfrConsolidatedStatements.deletedAt), eq(glfrConsolidatedStatements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrBudgets.id }).from(glfrBudgets)
        .where(and(eq(glfrBudgets.tenantId, user.tenantId), isNull(glfrBudgets.deletedAt), eq(glfrBudgets.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrVarianceAnalyses.id }).from(glfrVarianceAnalyses)
        .where(and(eq(glfrVarianceAnalyses.tenantId, user.tenantId), isNull(glfrVarianceAnalyses.deletedAt), eq(glfrVarianceAnalyses.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeAccounts,
        draftJournalEntries,
        openPeriods,
        draftStatements,
        draftSegmentReports,
        draftConsolidations,
        draftBudgets,
        draftVarianceAnalyses,
      },
    });
  } catch (error) {
    console.error("Failed to get GL hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
