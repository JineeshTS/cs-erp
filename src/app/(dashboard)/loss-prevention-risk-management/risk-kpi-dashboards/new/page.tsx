import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const KPI_DASHBOARD_FIELDS: FieldConfig[] = [
  {
    name: "dashboardType",
    label: "Dashboard Type",
    type: "select",
    required: true,
    options: [
      { value: "monthly_report", label: "Monthly Report" },
      { value: "quarterly_review", label: "Quarterly Review" },
      { value: "annual_report", label: "Annual Report" },
      { value: "board_summary", label: "Board Summary" },
      { value: "kpi_scorecard", label: "KPI Scorecard" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "totalRisks", label: "Total Risks", type: "number" },
  { name: "highRisks", label: "High Risks", type: "number" },
  { name: "incidentCount", label: "Incident Count", type: "number" },
  { name: "nearMissCount", label: "Near Miss Count", type: "number" },
  { name: "ltifRate", label: "LTIF Rate", type: "text" },
  { name: "trifRate", label: "TRIF Rate", type: "text" },
  { name: "insuranceClaims", label: "Insurance Claims", type: "text" },
  { name: "complianceRate", label: "Compliance Rate", type: "text" },
  { name: "boardPresentedDate", label: "Board Presented Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRiskKpiDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lpr:create"))
  )
    redirect("/loss-prevention-risk-management/risk-kpi-dashboards");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/risk-kpi-dashboards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Risk KPI Dashboard
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Risk KPI Dashboard"
          apiPath="/api/v1/loss-prevention-risk-management/risk-kpi-dashboards"
          fields={KPI_DASHBOARD_FIELDS}
          returnPath="/loss-prevention-risk-management/risk-kpi-dashboards"
        />
      </div>
    </div>
  );
}
