import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLoadFactorReport } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const LOAD_FACTOR_REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "voyage_utilization", label: "Voyage Utilization" },
      { value: "trade_lane_report", label: "Trade Lane Report" },
      { value: "vessel_performance", label: "Vessel Performance" },
      { value: "seasonal_analysis", label: "Seasonal Analysis" },
      { value: "benchmark_comparison", label: "Benchmark Comparison" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "tradeRoute", label: "Trade Route", type: "text" },
  { name: "totalCapacityTeu", label: "Total Capacity TEU", type: "number" },
  { name: "loadedTeu", label: "Loaded TEU", type: "number" },
  {
    name: "loadFactorPercentage",
    label: "Load Factor Percentage",
    type: "number",
  },
  { name: "weightUtilization", label: "Weight Utilization", type: "number" },
  { name: "revenuePerTeu", label: "Revenue Per TEU", type: "number" },
  { name: "reportCurrency", label: "Report Currency", type: "text" },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  {
    name: "emptyRepositioning",
    label: "Empty Repositioning",
    type: "number",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLoadFactorReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getLoadFactorReport(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    reportType: record.reportType ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    tradeRoute: record.tradeRoute ?? "",
    totalCapacityTeu: record.totalCapacityTeu ?? "",
    loadedTeu: record.loadedTeu ?? "",
    loadFactorPercentage: record.loadFactorPercentage ?? "",
    weightUtilization: record.weightUtilization ?? "",
    revenuePerTeu: record.revenuePerTeu ?? "",
    reportCurrency: record.reportCurrency ?? "",
    periodFrom: record.periodFrom
      ? new Date(record.periodFrom).toISOString().slice(0, 16)
      : "",
    periodTo: record.periodTo
      ? new Date(record.periodTo).toISOString().slice(0, 16)
      : "",
    emptyRepositioning: record.emptyRepositioning?.toString() ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/load-factor-reports/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.reportRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update load factor report details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Load Factor Report"
          apiPath={`/api/v1/liner-operations-control/load-factor-reports/${id}`}
          returnPath="/liner-operations-control/load-factor-reports"
          fields={LOAD_FACTOR_REPORT_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
