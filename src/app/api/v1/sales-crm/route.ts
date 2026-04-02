import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  scmCustomers,
  scmOpportunities,
  scmRateQuotations,
  scmContracts,
  scmLeads,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const [
      [customersResult],
      [opportunitiesResult],
      [quotationsResult],
      [contractsResult],
      [leadsResult],
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(scmCustomers)
        .where(
          and(
            eq(scmCustomers.tenantId, user.tenantId),
            isNull(scmCustomers.deletedAt),
            eq(scmCustomers.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(scmOpportunities)
        .where(
          and(
            eq(scmOpportunities.tenantId, user.tenantId),
            isNull(scmOpportunities.deletedAt),
            eq(scmOpportunities.status, "open")
          )
        ),
      db
        .select({ count: count() })
        .from(scmRateQuotations)
        .where(
          and(
            eq(scmRateQuotations.tenantId, user.tenantId),
            isNull(scmRateQuotations.deletedAt),
            eq(scmRateQuotations.status, "draft")
          )
        ),
      db
        .select({ count: count() })
        .from(scmContracts)
        .where(
          and(
            eq(scmContracts.tenantId, user.tenantId),
            isNull(scmContracts.deletedAt),
            eq(scmContracts.status, "active")
          )
        ),
      db
        .select({ count: count() })
        .from(scmLeads)
        .where(
          and(
            eq(scmLeads.tenantId, user.tenantId),
            isNull(scmLeads.deletedAt),
            eq(scmLeads.status, "new")
          )
        ),
    ]);

    return NextResponse.json({
      data: {
        activeCustomers: customersResult.count,
        openOpportunities: opportunitiesResult.count,
        draftQuotations: quotationsResult.count,
        activeContracts: contractsResult.count,
        newLeads: leadsResult.count,
      },
    });
  } catch (error) {
    console.error("Failed to get sales-crm summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
