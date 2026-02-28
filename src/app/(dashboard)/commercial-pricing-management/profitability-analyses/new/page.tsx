import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "analysisName", label: "Analysis Name", type: "text", required: true },
  {
    name: "analysisType",
    label: "Analysis Type",
    type: "select",
    options: [
      { label: "Trade Lane", value: "trade_lane" },
      { label: "Customer", value: "customer" },
      { label: "Voyage", value: "voyage" },
      { label: "Service", value: "service" },
      { label: "Overall", value: "overall" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "customerId", label: "Customer ID", type: "text" },
  { name: "voyageId", label: "Voyage ID", type: "text" },
  { name: "periodFrom", label: "Period From", type: "date", required: true },
  { name: "periodTo", label: "Period To", type: "date", required: true },
  { name: "totalRevenue", label: "Total Revenue", type: "number" },
  { name: "totalCost", label: "Total Cost", type: "number" },
  { name: "grossProfit", label: "Gross Profit", type: "number" },
  { name: "marginPercent", label: "Margin %", type: "number" },
  { name: "teuCount", label: "TEU Count", type: "number" },
  { name: "revenuePerTeu", label: "Revenue Per TEU", type: "number" },
  { name: "costPerTeu", label: "Cost Per TEU", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Final", value: "final" },
      { label: "Archived", value: "archived" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewProfitabilityAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/profitability-analyses"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Profitability Analysis</h1>
      </div>

      <CpmForm
        entityType="Profitability Analysis"
        fields={fields}
        apiPath="/api/v1/commercial-pricing-management/profitability-analyses"
        returnPath="/commercial-pricing-management/profitability-analyses"
      />
    </div>
  );
}
