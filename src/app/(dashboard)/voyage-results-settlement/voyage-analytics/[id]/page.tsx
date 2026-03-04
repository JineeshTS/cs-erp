import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageAnalytics } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyageAnalyticsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vrs:edit"
  );

  const { id } = await params;
  const record = await getVoyageAnalytics(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/voyage-analytics"
            className="rounded-md border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.analyticsRef}
            </h1>
            <p className="text-sm text-gray-500">{record.title || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              record.status === "verified"
                ? "success"
                : record.status === "published"
                  ? "default"
                  : "secondary"
            }
          >
            {record.status}
          </Badge>
          {canEdit && (
            <Link
              href={`/voyage-results-settlement/voyage-analytics/${record.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Analytics Ref</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.analyticsRef || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Analytics Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {record.analyticsType?.replace(/_/g, " ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.title || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.periodFrom
                ? new Date(record.periodFrom).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.periodTo
                ? new Date(record.periodTo).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Voyages</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.totalVoyages !== null && record.totalVoyages !== undefined
                ? record.totalVoyages
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Avg TCE</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.avgTce !== null && record.avgTce !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.avgTce))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Avg Margin</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.avgMargin !== null && record.avgMargin !== undefined
                ? (Number(record.avgMargin) * 100).toFixed(2) + "%"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Revenue</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.totalRevenue !== null && record.totalRevenue !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.totalRevenue))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Costs</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.totalCosts !== null && record.totalCosts !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.totalCosts))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Top Performer</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.topPerformer || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Report URL</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.reportUrl ? (
                <a
                  href={record.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {record.reportUrl}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
