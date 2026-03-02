import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "market_overview", label: "Market Overview" },
      { value: "competitor_analysis", label: "Competitor Analysis" },
      { value: "rate_benchmark", label: "Rate Benchmark" },
      { value: "capacity_analysis", label: "Capacity Analysis" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "region", label: "Region", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "marketSize", label: "Market Size", type: "number" },
  { name: "marketGrowthPct", label: "Market Growth %", type: "number" },
  { name: "ourMarketSharePct", label: "Our Market Share %", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "avgMarketRate", label: "Avg Market Rate", type: "number" },
  { name: "ourAvgRate", label: "Our Avg Rate", type: "number" },
  { name: "ratePremiumPct", label: "Rate Premium %", type: "number" },
  { name: "recommendations", label: "Recommendations", type: "textarea" },
  { name: "source", label: "Source", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewMarketIntelligenceReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/market-intelligence-reports");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/market-intelligence-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Market Intelligence Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Market Intelligence Report"
          apiPath="/api/v1/analytics-business-intelligence/market-intelligence-reports"
          fields={REPORT_FIELDS}
          returnPath="/analytics-business-intelligence/market-intelligence-reports"
        />
      </div>
    </div>
  );
}
