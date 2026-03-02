import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

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
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "totalTeu", label: "Total TEU", type: "number" },
  { name: "totalShipments", label: "Total Shipments", type: "number" },
  { name: "revenue", label: "Revenue", type: "number" },
  { name: "avgRatePerTeu", label: "Avg Rate Per TEU", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "marketSharePct", label: "Market Share %", type: "number" },
  { name: "volumeGrowthPct", label: "Volume Growth %", type: "number" },
  { name: "avgTransitDays", label: "Avg Transit Days", type: "number" },
  { name: "reliabilityPct", label: "Reliability %", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewTradeLaneAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/trade-lane-analytics");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/trade-lane-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Trade Lane Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Trade Lane Analytics"
          apiPath="/api/v1/analytics-business-intelligence/trade-lane-analytics"
          fields={TRADE_LANE_ANALYTICS_FIELDS}
          returnPath="/analytics-business-intelligence/trade-lane-analytics"
        />
      </div>
    </div>
  );
}
