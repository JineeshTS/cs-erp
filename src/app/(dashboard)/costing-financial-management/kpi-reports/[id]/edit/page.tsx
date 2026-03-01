import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getKpiReport } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function EditKpiReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");

  const { id } = await params;
  const report = await getKpiReport(id, session.tenantId);
  if (!report) notFound();

  const fields: FieldConfig[] = [
    {
      name: "reportName",
      label: "Report Name",
      type: "text",
      required: true,
    },
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "annual", label: "Annual" },
        { value: "voyage", label: "Voyage" },
        { value: "service_route", label: "Service Route" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      name: "reportPeriod",
      label: "Report Period",
      type: "text",
      required: true,
    },
    {
      name: "reportYear",
      label: "Report Year",
      type: "number",
      required: true,
    },
    { name: "reportMonth", label: "Report Month", type: "number" },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    { name: "totalRevenue", label: "Total Revenue", type: "number" },
    { name: "totalCost", label: "Total Cost", type: "number" },
    { name: "grossProfit", label: "Gross Profit", type: "number" },
    { name: "netProfit", label: "Net Profit", type: "number" },
    { name: "ebitda", label: "EBITDA", type: "number" },
    { name: "operatingRatio", label: "Operating Ratio (%)", type: "number" },
    { name: "revenuePerTeu", label: "Revenue per TEU", type: "number" },
    { name: "costPerTeu", label: "Cost per TEU", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    reportName: report.reportName,
    reportType: report.reportType,
    reportPeriod: report.reportPeriod,
    reportYear: report.reportYear,
    reportMonth: report.reportMonth,
    currency: report.currency,
    totalRevenue: report.totalRevenue,
    totalCost: report.totalCost,
    grossProfit: report.grossProfit,
    netProfit: report.netProfit,
    ebitda: report.ebitda,
    operatingRatio: report.operatingRatio,
    revenuePerTeu: report.revenuePerTeu,
    costPerTeu: report.costPerTeu,
    notes: report.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/kpi-reports/${report.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {report.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update KPI report details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="KPI Report"
          apiPath={`/api/v1/costing-financial-management/kpi-reports/${report.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/kpi-reports"
        />
      </div>
    </div>
  );
}
