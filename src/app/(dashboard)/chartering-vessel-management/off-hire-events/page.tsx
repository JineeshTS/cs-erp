import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt } from "drizzle-orm";
import { cvmOffHireEvents } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OffHireEventsPage({
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
    eq(cvmOffHireEvents.tenantId, session.tenantId),
    isNull(cvmOffHireEvents.deletedAt),
  ];
  if (cursor)
    conditions.push(lt(cvmOffHireEvents.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(cvmOffHireEvents)
    .where(and(...conditions))
    .orderBy(desc(cvmOffHireEvents.createdAt))
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
            Off-Hire Events
          </h1>
          <p className="text-sm text-gray-500">
            Track off-hire events and claims across charter parties
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/off-hire-events/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Off-Hire Event
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No off-hire events found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/off-hire-events/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Record your first off-hire event
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Event Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Start Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Off-Hire Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Claim Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((oh) => (
                <tr
                  key={oh.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/off-hire-events/${oh.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {oh.eventType}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {oh.vesselName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(oh.startAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {oh.offHireDays || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {oh.offHireAmount !== null
                      ? oh.offHireAmount.toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        oh.claimStatus === "settled"
                          ? "success"
                          : oh.claimStatus === "disputed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {oh.claimStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/chartering-vessel-management/off-hire-events?cursor=${encodeURIComponent(nextCursor)}`}
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
