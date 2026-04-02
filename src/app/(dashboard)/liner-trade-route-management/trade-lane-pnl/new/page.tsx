import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewTradeLanePnlPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:create")))
    redirect("/");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    { name: "tradeLaneName", label: "Trade Lane Name", type: "text", required: true },
    { name: "serviceLoopName", label: "Service Loop Name", type: "text" },
    { name: "periodStart", label: "Period Start", type: "datetime-local", required: true },
    { name: "periodEnd", label: "Period End", type: "datetime-local", required: true },
    {
      name: "periodType",
      label: "Period Type",
      type: "select",
      required: true,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "semi_annual", label: "Semi-Annual" },
        { value: "annual", label: "Annual" },
      ],
    },
    { name: "volumeTeu", label: "Volume (TEU)", type: "number" },
    { name: "revenue", label: "Revenue", type: "text" },
    { name: "bunkerCost", label: "Bunker Cost", type: "text" },
    { name: "portCost", label: "Port Cost", type: "text" },
    { name: "canalCost", label: "Canal Cost", type: "text" },
    { name: "equipmentCost", label: "Equipment Cost", type: "text" },
    { name: "overheadCost", label: "Overhead Cost", type: "text" },
    { name: "totalCost", label: "Total Cost", type: "text" },
    { name: "grossProfit", label: "Gross Profit", type: "text" },
    { name: "grossMarginPercent", label: "Gross Margin %", type: "text" },
    { name: "contributionMargin", label: "Contribution Margin", type: "text" },
    { name: "revenuePerTeu", label: "Revenue per TEU", type: "text" },
    { name: "costPerTeu", label: "Cost per TEU", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/liner-trade-route-management/trade-lane-pnl"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Trade Lane P&amp;L
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New Trade Lane P&amp;L Record
        </h1>
      </div>

      <LtrForm
        entityType="Trade Lane P&L"
        apiPath="/api/v1/liner-trade-route-management/trade-lane-pnl"
        fields={fields}
        returnPath="/liner-trade-route-management/trade-lane-pnl"
      />
    </div>
  );
}
