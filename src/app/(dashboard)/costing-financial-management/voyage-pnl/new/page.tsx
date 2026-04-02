import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CfmForm, type FieldConfig } from "@/components/costing-financial-management/cfm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewVoyagePnlPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "costing:create"))
  )
    redirect("/costing-financial-management/voyage-pnl");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const VOYAGE_PNL_FIELDS: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "serviceRoute", label: "Service Route", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "freightRevenue", label: "Freight Revenue", type: "number" },
    { name: "demurrageRevenue", label: "Demurrage Revenue", type: "number" },
    { name: "otherRevenue", label: "Other Revenue", type: "number" },
    {
      name: "totalRevenue",
      label: "Total Revenue",
      type: "number",
      required: true,
    },
    { name: "bunkerCost", label: "Bunker Cost", type: "number" },
    { name: "portCost", label: "Port Cost", type: "number" },
    { name: "commissionCost", label: "Commission Cost", type: "number" },
    { name: "charterCost", label: "Charter Cost", type: "number" },
    { name: "overheadCost", label: "Overhead Cost", type: "number" },
    { name: "otherCost", label: "Other Cost", type: "number" },
    {
      name: "totalCost",
      label: "Total Cost",
      type: "number",
      required: true,
    },
    {
      name: "grossProfit",
      label: "Gross Profit",
      type: "number",
      required: true,
    },
    {
      name: "netProfit",
      label: "Net Profit",
      type: "number",
      required: true,
    },
    { name: "profitMargin", label: "Profit Margin (%)", type: "number" },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/costing-financial-management/voyage-pnl"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage P&L Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Voyage P&L Report"
          apiPath="/api/v1/costing-financial-management/voyage-pnl"
          fields={VOYAGE_PNL_FIELDS}
          returnPath="/costing-financial-management/voyage-pnl"
        />
      </div>
    </div>
  );
}
