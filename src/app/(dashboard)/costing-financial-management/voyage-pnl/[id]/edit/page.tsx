import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyagePnlReport } from "@/lib/costing-financial-management/service";
import { CfmForm, type FieldConfig } from "@/components/costing-financial-management/cfm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditVoyagePnlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
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

  const { id } = await params;
  const report = await getVoyagePnlReport(id, session.tenantId);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/costing-financial-management/voyage-pnl/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Voyage P&L Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Voyage P&L Report"
          apiPath={`/api/v1/costing-financial-management/voyage-pnl/${id}`}
          fields={VOYAGE_PNL_FIELDS}
          initialData={{
            voyageRef: report.voyageRef ?? "",
            vesselName: report.vesselName ?? "",
            serviceRoute: report.serviceRoute ?? "",
            currency: report.currency ?? "",
            freightRevenue: report.freightRevenue != null ? Number(report.freightRevenue) : "",
            demurrageRevenue: report.demurrageRevenue != null ? Number(report.demurrageRevenue) : "",
            otherRevenue: report.otherRevenue != null ? Number(report.otherRevenue) : "",
            totalRevenue: report.totalRevenue != null ? Number(report.totalRevenue) : "",
            bunkerCost: report.bunkerCost != null ? Number(report.bunkerCost) : "",
            portCost: report.portCost != null ? Number(report.portCost) : "",
            commissionCost: report.commissionCost != null ? Number(report.commissionCost) : "",
            charterCost: report.charterCost != null ? Number(report.charterCost) : "",
            overheadCost: report.overheadCost != null ? Number(report.overheadCost) : "",
            otherCost: report.otherCost != null ? Number(report.otherCost) : "",
            totalCost: report.totalCost != null ? Number(report.totalCost) : "",
            grossProfit: report.grossProfit != null ? Number(report.grossProfit) : "",
            netProfit: report.netProfit != null ? Number(report.netProfit) : "",
            profitMargin: report.profitMargin != null ? Number(report.profitMargin) : "",
            periodStart: report.periodStart ? new Date(report.periodStart).toISOString() : "",
            periodEnd: report.periodEnd ? new Date(report.periodEnd).toISOString() : "",
            notes: report.notes ?? "",
          }}
          isEdit
          returnPath={`/costing-financial-management/voyage-pnl/${id}`}
        />
      </div>
    </div>
  );
}
