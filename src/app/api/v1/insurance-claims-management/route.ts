import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  icmPiClubPolicies,
  icmHullMachineryInsurances,
  icmCargoInsurancePolicies,
  icmClaimsRegistrations,
  icmClaimsRecoveries,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "insurance:read")))
      return forbiddenResponse();

    const [
      activePiPolicies,
      activeHullInsurances,
      activeCargoInsurances,
      openClaims,
      openRecoveries,
    ] = await Promise.all([
      db.select({ value: count() }).from(icmPiClubPolicies)
        .where(and(eq(icmPiClubPolicies.tenantId, user.tenantId), isNull(icmPiClubPolicies.deletedAt), eq(icmPiClubPolicies.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icmHullMachineryInsurances)
        .where(and(eq(icmHullMachineryInsurances.tenantId, user.tenantId), isNull(icmHullMachineryInsurances.deletedAt), eq(icmHullMachineryInsurances.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icmCargoInsurancePolicies)
        .where(and(eq(icmCargoInsurancePolicies.tenantId, user.tenantId), isNull(icmCargoInsurancePolicies.deletedAt), eq(icmCargoInsurancePolicies.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icmClaimsRegistrations)
        .where(and(eq(icmClaimsRegistrations.tenantId, user.tenantId), isNull(icmClaimsRegistrations.deletedAt), eq(icmClaimsRegistrations.status, "open")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icmClaimsRecoveries)
        .where(and(eq(icmClaimsRecoveries.tenantId, user.tenantId), isNull(icmClaimsRecoveries.deletedAt), eq(icmClaimsRecoveries.status, "open")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activePiPolicies,
        activeHullInsurances,
        activeCargoInsurances,
        openClaims,
        openRecoveries,
      },
    });
  } catch (error) {
    console.error("Failed to get insurance claims hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
