import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewLoadFactorReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/liner-operations-control/load-factor-reports"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Load Factor Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new load factor and utilization report
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Load Factor Report"
          apiPath="/api/v1/liner-operations-control/load-factor-reports"
          returnPath="/liner-operations-control/load-factor-reports"
          fields={LOAD_FACTOR_REPORT_FIELDS}
        />
      </div>
    </div>
  );
}
