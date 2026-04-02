import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTradeLaneAnalytic } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditTradeLaneAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/trade-lane-analytics");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const TRADE_LANE_ANALYTICS_FIELDS: FieldConfig[] = [
    {
      name: "analyticsType",
      label: "Analytics Type",
      type: "select",
      required: true,
      options: [
        { value: "lane_performance", label: "Lane Performance" },
        { value: "volume_trend", label: "Volume Trend" },
        { value: "rate_analysis", label: "Rate Analysis" },
        { value: "market_share", label: "Market Share" },
      ],
    },
    {
      name: "tradeLaneName",
      label: "Trade Lane Name",
      type: "text",
      required: true,
    },
    { name: "originRegion", label: "Origin Region", type: "text" },
    { name: "destinationRegion", label: "Destination Region", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "totalTeu", label: "Total TEU", type: "number" },
    { name: "totalShipments", label: "Total Shipments", type: "number" },
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "avgRatePerTeu", label: "Avg Rate Per TEU", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "marketSharePct", label: "Market Share %", type: "number" },
    { name: "volumeGrowthPct", label: "Volume Growth %", type: "number" },
    { name: "avgTransitDays", label: "Avg Transit Days", type: "number" },
    { name: "reliabilityPct", label: "Reliability %", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getTradeLaneAnalytic(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/trade-lane-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Trade Lane Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Trade Lane Analytics"
          apiPath={`/api/v1/analytics-business-intelligence/trade-lane-analytics/${id}`}
          fields={TRADE_LANE_ANALYTICS_FIELDS}
          initialData={{
            analyticsType: record.analyticsType,
            tradeLaneName: record.tradeLaneName,
            originRegion: record.originRegion ?? "",
            destinationRegion: record.destinationRegion ?? "",
            originPort: record.originPort ?? "",
            destinationPort: record.destinationPort ?? "",
            periodStart: record.periodStart
              ? record.periodStart.toISOString()
              : "",
            periodEnd: record.periodEnd
              ? record.periodEnd.toISOString()
              : "",
            totalTeu: record.totalTeu ? Number(record.totalTeu) : "",
            totalShipments: record.totalShipments ?? "",
            revenue: record.revenue ? Number(record.revenue) : "",
            avgRatePerTeu: record.avgRatePerTeu
              ? Number(record.avgRatePerTeu)
              : "",
            currency: record.currency ?? "",
            marketSharePct: record.marketSharePct
              ? Number(record.marketSharePct)
              : "",
            volumeGrowthPct: record.volumeGrowthPct
              ? Number(record.volumeGrowthPct)
              : "",
            avgTransitDays: record.avgTransitDays
              ? Number(record.avgTransitDays)
              : "",
            reliabilityPct: record.reliabilityPct
              ? Number(record.reliabilityPct)
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/trade-lane-analytics/${id}`}
        />
      </div>
    </div>
  );
}
