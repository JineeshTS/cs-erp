import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProfitBenchmark } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

export default async function ProfitBenchmarkDetailPage({
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
  const record = await getProfitBenchmark(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/profit-benchmarks"
            className="rounded-md border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.benchmarkRef}
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
              href={`/voyage-results-settlement/profit-benchmarks/${record.id}/edit`}
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
            <dt className="text-xs font-medium text-gray-500">Benchmark Ref</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.benchmarkRef || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Benchmark Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {record.benchmarkType?.replace(/_/g, " ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.title || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.voyageNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.vesselName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.tradeLane || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Actual TCE</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.actualTce !== null && record.actualTce !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.actualTce))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Benchmark TCE</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.benchmarkTce !== null && record.benchmarkTce !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.benchmarkTce))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Variance TCE</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.varianceTce !== null && record.varianceTce !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(record.varianceTce))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Actual Margin</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.actualMargin !== null && record.actualMargin !== undefined
                ? (Number(record.actualMargin) * 100).toFixed(2) + "%"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Benchmark Margin</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.benchmarkMargin !== null && record.benchmarkMargin !== undefined
                ? (Number(record.benchmarkMargin) * 100).toFixed(2) + "%"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Performance Score</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {record.performanceScore !== null && record.performanceScore !== undefined
                ? Number(record.performanceScore).toFixed(2)
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">AI Insights</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.aiInsights || "—"}
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
