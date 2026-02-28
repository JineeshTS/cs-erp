import Link from "next/link";
import { Plus, Ship } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt } from "drizzle-orm";
import { cvmLaytimeCalculations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LaytimeCalculationsPage({
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
    eq(cvmLaytimeCalculations.tenantId, session.tenantId),
    isNull(cvmLaytimeCalculations.deletedAt),
  ];
  if (cursor)
    conditions.push(lt(cvmLaytimeCalculations.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(cvmLaytimeCalculations)
    .where(and(...conditions))
    .orderBy(desc(cvmLaytimeCalculations.createdAt))
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
            Laytime Calculations
          </h1>
          <p className="text-sm text-gray-500">
            Manage laytime, demurrage, and despatch calculations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/laytime-calculations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Laytime Calculation
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Ship className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No laytime calculations found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/laytime-calculations/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first laytime calculation
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Operation
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Allowed Hours
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Used Hours
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Dem/Des Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((lc) => (
                <tr
                  key={lc.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/laytime-calculations/${lc.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {lc.portName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lc.operationType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lc.allowedHours}h
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lc.usedHours}h
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lc.demurrageAmount
                      ? `D: ${lc.demurrageAmount.toLocaleString()}`
                      : lc.despatchAmount
                        ? `S: ${lc.despatchAmount.toLocaleString()}`
                        : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        lc.status === "settled"
                          ? "success"
                          : lc.status === "calculating"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {lc.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/chartering-vessel-management/laytime-calculations?cursor=${encodeURIComponent(nextCursor)}`}
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
