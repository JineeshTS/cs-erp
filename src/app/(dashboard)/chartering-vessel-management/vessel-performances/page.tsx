import Link from "next/link";
import { Plus, Activity } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt } from "drizzle-orm";
import { cvmVesselPerformances } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function VesselPerformancesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:create"
  );

  const sp = await searchParams;
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(cvmVesselPerformances.tenantId, session.tenantId),
    isNull(cvmVesselPerformances.deletedAt),
  ];
  if (cursor)
    conditions.push(
      cursorCondition(cvmVesselPerformances.createdAt, cvmVesselPerformances.id, parseCompoundCursor(cursor)!)
    );

  const data = await db
    .select()
    .from(cvmVesselPerformances)
    .where(and(...conditions))
    .orderBy(desc(cvmVesselPerformances.createdAt), desc(cvmVesselPerformances.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vessel Performances
          </h1>
          <p className="text-sm text-gray-500">
            Monitor vessel performance reports across voyages
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/vessel-performances/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Performance Report
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Activity className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No vessel performance reports found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/vessel-performances/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first performance report
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Report Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Speed (kn)
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Consumption (MT)
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Distance (NM)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((vp) => (
                <tr
                  key={vp.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/vessel-performances/${vp.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {vp.vesselName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(vp.reportDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{vp.reportType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vp.speedKnots || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vp.consumptionMt || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vp.distanceNm || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/chartering-vessel-management/vessel-performances?cursor=${encodeURIComponent(nextCursor)}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
