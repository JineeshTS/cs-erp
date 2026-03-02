import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCustomerRevenueAnalytic } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

export default async function CustomerRevenueAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { id } = await params;

  const record = await getCustomerRevenueAnalytic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/customer-revenue-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analyticsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.customerName} &middot; {record.analyticsType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/analytics-business-intelligence/customer-revenue-analytics/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Analytics Ref</dt>
            <dd className="mt-1 text-gray-900">{record.analyticsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analytics Type</dt>
            <dd className="mt-1 text-gray-900">{record.analyticsType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{record.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.customerCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Segment
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.customerSegment || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodStart
                ? new Date(record.periodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodEnd
                ? new Date(record.periodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalRevenue
                ? `${record.totalRevenue} ${record.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Costs</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCosts
                ? `${record.totalCosts} ${record.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Profit</dt>
            <dd className="mt-1 text-gray-900">
              {record.grossProfit
                ? `${record.grossProfit} ${record.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Margin %
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.grossMarginPct ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total TEU</dt>
            <dd className="mt-1 text-gray-900">{record.totalTeu || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Shipments
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalShipments ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Revenue Per Shipment
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.avgRevenuePerShipment || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Terms (Days)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.paymentTermsDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Days to Payment
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.avgDaysToPayment || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Outstanding Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.outstandingBalance
                ? `${record.outstandingBalance} ${record.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Lifetime Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lifetimeValue
                ? `${record.lifetimeValue} ${record.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "published"
                    ? "success"
                    : record.status === "archived"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
