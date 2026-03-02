import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";

const INTELLIGENCE_FIELDS: FieldConfig[] = [
  { name: "tradeRoute", label: "Trade Route", type: "text", required: true },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "dataSource", label: "Data Source", type: "text", required: true },
  {
    name: "indexType",
    label: "Index Type",
    type: "select",
    required: true,
    options: [
      { value: "scfi", label: "SCFI" },
      { value: "fbx", label: "FBX" },
      { value: "wci", label: "WCI" },
      { value: "ccfi", label: "CCFI" },
      { value: "custom", label: "Custom" },
    ],
  },
  { name: "indexValue", label: "Index Value", type: "text" },
  { name: "indexDate", label: "Index Date", type: "datetime-local", required: true },
  { name: "spotRate", label: "Spot Rate", type: "text" },
  { name: "contractRate", label: "Contract Rate", type: "text" },
  {
    name: "rateUnit",
    label: "Rate Unit",
    type: "select",
    options: [
      { value: "per_teu", label: "Per TEU" },
      { value: "per_feu", label: "Per FEU" },
      { value: "per_cbm", label: "Per CBM" },
      { value: "per_ton", label: "Per Ton" },
    ],
  },
  { name: "currency", label: "Currency", type: "text" },
  { name: "capacityUtilization", label: "Capacity Utilization", type: "text" },
  {
    name: "marketTrend",
    label: "Market Trend",
    type: "select",
    options: [
      { value: "rising", label: "Rising" },
      { value: "falling", label: "Falling" },
      { value: "stable", label: "Stable" },
      { value: "volatile", label: "Volatile" },
    ],
  },
  { name: "sentimentScore", label: "Sentiment Score", type: "text" },
  { name: "aiInsights", label: "AI Insights", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewMarketIntelligencePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:create")))
    redirect("/liner-trade-route-management/market-intelligence");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/market-intelligence"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Market Intelligence
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Market Intelligence"
          apiPath="/api/v1/liner-trade-route-management/market-intelligence"
          fields={INTELLIGENCE_FIELDS}
          returnPath="/liner-trade-route-management/market-intelligence"
        />
      </div>
    </div>
  );
}
