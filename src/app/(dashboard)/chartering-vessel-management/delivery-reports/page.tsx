import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt } from "drizzle-orm";
import { cvmDeliveryReports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function DeliveryReportsPage({
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
    eq(cvmDeliveryReports.tenantId, session.tenantId),
    isNull(cvmDeliveryReports.deletedAt),
  ];
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(cvmDeliveryReports.createdAt, cvmDeliveryReports.id, parsedCursor));

  const data = await db
    .select()
    .from(cvmDeliveryReports)
    .where(and(...conditions))
    .orderBy(desc(cvmDeliveryReports.createdAt), desc(cvmDeliveryReports.id))
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
            Delivery Reports
          </h1>
          <p className="text-sm text-gray-500">
            Manage vessel delivery and redelivery reports
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/delivery-reports/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Delivery Report
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No delivery reports found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/delivery-reports/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first delivery report
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Report Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Report Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((dr) => (
                <tr
                  key={dr.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/delivery-reports/${dr.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {dr.reportType}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {dr.vesselName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {dr.portName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(dr.reportDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        dr.status === "final" ? "success" : "secondary"
                      }
                    >
                      {dr.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/chartering-vessel-management/delivery-reports?cursor=${encodeURIComponent(nextCursor)}`}
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
