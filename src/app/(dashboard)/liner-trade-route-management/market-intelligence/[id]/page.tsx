import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMarketIntelligence } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  verified: "success",
  outdated: "warning",
  archived: "outline",
} as const;

const trendVariant = {
  rising: "success",
  falling: "destructive",
  stable: "secondary",
  volatile: "warning",
} as const;

export default async function MarketIntelligenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const intel = await getMarketIntelligence(id, session.tenantId);
  if (!intel) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/market-intelligence"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {intel.intelligenceRef}
          </h1>
          <p className="text-sm text-gray-500">
            {intel.tradeRoute} &middot; {intel.dataSource}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/market-intelligence/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Intelligence Ref</dt>
            <dd className="mt-1 text-gray-900">{intel.intelligenceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Route</dt>
            <dd className="mt-1 text-gray-900">{intel.tradeRoute}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{intel.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">
              {intel.destinationPort || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Data Source</dt>
            <dd className="mt-1 text-gray-900">{intel.dataSource}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Index Type</dt>
            <dd className="mt-1 text-gray-900">{intel.indexType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Index Value</dt>
            <dd className="mt-1 text-gray-900">
              {intel.indexValue != null ? String(intel.indexValue) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Index Date</dt>
            <dd className="mt-1 text-gray-900">
              {intel.indexDate
                ? new Date(intel.indexDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Spot Rate</dt>
            <dd className="mt-1 text-gray-900">
              {intel.spotRate != null ? String(intel.spotRate) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contract Rate</dt>
            <dd className="mt-1 text-gray-900">
              {intel.contractRate != null ? String(intel.contractRate) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Unit</dt>
            <dd className="mt-1 text-gray-900">{intel.rateUnit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{intel.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Capacity Utilization
            </dt>
            <dd className="mt-1 text-gray-900">
              {intel.capacityUtilization != null
                ? String(intel.capacityUtilization)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Market Trend</dt>
            <dd className="mt-1">
              {intel.marketTrend ? (
                <Badge
                  variant={
                    trendVariant[
                      intel.marketTrend as keyof typeof trendVariant
                    ] ?? "secondary"
                  }
                >
                  {intel.marketTrend}
                </Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sentiment Score</dt>
            <dd className="mt-1 text-gray-900">
              {intel.sentimentScore != null
                ? String(intel.sentimentScore)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    intel.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {intel.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">AI Insights</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {intel.aiInsights || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {intel.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
