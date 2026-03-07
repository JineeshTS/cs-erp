import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getTradeLanePnl } from "@/lib/liner-trade-route-management/service";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditTradeLanePnlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:edit")))
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

  const { id } = await params;
  const record = await getTradeLanePnl(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/liner-trade-route-management/trade-lane-pnl/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.pnlRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.pnlRef}
        </h1>
      </div>

      <LtrForm
        entityType="Trade Lane P&L"
        apiPath={`/api/v1/liner-trade-route-management/trade-lane-pnl/${record.id}`}
        fields={fields}
        initialData={{
          tradeLaneName: record.tradeLaneName,
          serviceLoopName: record.serviceLoopName ?? "",
          periodStart: record.periodStart ?? "",
          periodEnd: record.periodEnd ?? "",
          periodType: record.periodType,
          volumeTeu: record.volumeTeu ?? "",
          revenue: record.revenue ?? "",
          bunkerCost: record.bunkerCost ?? "",
          portCost: record.portCost ?? "",
          canalCost: record.canalCost ?? "",
          equipmentCost: record.equipmentCost ?? "",
          overheadCost: record.overheadCost ?? "",
          totalCost: record.totalCost ?? "",
          grossProfit: record.grossProfit ?? "",
          grossMarginPercent: record.grossMarginPercent ?? "",
          contributionMargin: record.contributionMargin ?? "",
          revenuePerTeu: record.revenuePerTeu ?? "",
          costPerTeu: record.costPerTeu ?? "",
          currency: record.currency ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/liner-trade-route-management/trade-lane-pnl/${record.id}`}
      />
    </div>
  );
}
