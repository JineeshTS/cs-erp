import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  arccCustomerAccounts,
  arccCreditLimits,
  arccAgingReports,
  arccCashApplications,
  arccCollectionWorkflows,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "receivable:read")))
      return forbiddenResponse();

    const [
      activeAccounts,
      highRiskCredits,
      pendingApplications,
      openCollections,
      overdueReports,
    ] = await Promise.all([
      db.select({ value: count() }).from(arccCustomerAccounts)
        .where(and(eq(arccCustomerAccounts.tenantId, user.tenantId), isNull(arccCustomerAccounts.deletedAt), eq(arccCustomerAccounts.accountStatus, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(arccCreditLimits)
        .where(and(eq(arccCreditLimits.tenantId, user.tenantId), isNull(arccCreditLimits.deletedAt), eq(arccCreditLimits.riskCategory, "high")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(arccCashApplications)
        .where(and(eq(arccCashApplications.tenantId, user.tenantId), isNull(arccCashApplications.deletedAt), eq(arccCashApplications.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(arccCollectionWorkflows)
        .where(and(eq(arccCollectionWorkflows.tenantId, user.tenantId), isNull(arccCollectionWorkflows.deletedAt), eq(arccCollectionWorkflows.status, "open")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(arccAgingReports)
        .where(and(eq(arccAgingReports.tenantId, user.tenantId), isNull(arccAgingReports.deletedAt), eq(arccAgingReports.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activeAccounts,
        highRiskCredits,
        pendingApplications,
        openCollections,
        overdueReports,
      },
    });
  } catch (error) {
    console.error("Failed to get AR hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
