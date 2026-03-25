import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { voyagePortCalls } from "@/db/schema/schedule-engine";
import { eq, and, asc } from "drizzle-orm";

/**
 * GET /api/v1/schedule-engine/voyages/[id]/port-calls
 *
 * Returns all port calls for a specific generated voyage, ordered by sequence.
 * Includes planned/actual times, cutoffs, delays, and status.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const { id } = await params;

  const rows = await db
    .select()
    .from(voyagePortCalls)
    .where(and(
      eq(voyagePortCalls.voyageId, id),
      eq(voyagePortCalls.tenantId, user.tenantId),
    ))
    .orderBy(asc(voyagePortCalls.sequence));

  return NextResponse.json({ data: rows });
}
