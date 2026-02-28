import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capRevenueAnalytics } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function RevenueAnalyticsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const ra = await db
    .select()
    .from(capRevenueAnalytics)
    .where(
      and(
        eq(capRevenueAnalytics.id, id),
        eq(capRevenueAnalytics.tenantId, session.tenantId),
        isNull(capRevenueAnalytics.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ra) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/revenue-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {ra.tradeLane ?? "Revenue Analytics"}
          </h1>
          <p className="text-sm text-gray-500">
            {ra.originPort ?? "-"} &rarr; {ra.destinationPort ?? "-"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/revenue-analytics/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Schedule ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {ra.vesselScheduleId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-gray-900">{ra.tradeLane ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{ra.originPort ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Port
            </dt>
            <dd className="mt-1 text-gray-900">
              {ra.destinationPort ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">
              {ra.periodFrom
                ? new Date(ra.periodFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">
              {ra.periodTo
                ? new Date(ra.periodTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total TEU</dt>
            <dd className="mt-1 text-gray-900">{ra.totalTeu ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {ra.totalRevenue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Revenue per TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {ra.revenuePerTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Average Rate
            </dt>
            <dd className="mt-1 text-gray-900">{ra.averageRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{ra.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calculated At
            </dt>
            <dd className="mt-1 text-gray-900">
              {ra.calculatedAt
                ? new Date(ra.calculatedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ra.status === "published"
                    ? "success"
                    : ra.status === "calculated"
                      ? "default"
                      : "secondary"
                }
              >
                {ra.status}
              </Badge>
            </dd>
          </div>
          {ra.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ra.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {ra.containerTypeBreakdown != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Container Type Breakdown
          </h2>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(
              ra.containerTypeBreakdown as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {ra.commodityBreakdown != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Commodity Breakdown
          </h2>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(
              ra.commodityBreakdown as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {ra.comparisonPreviousPeriod != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Comparison with Previous Period
          </h2>
          <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(
              ra.comparisonPreviousPeriod as Record<string, unknown>,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
