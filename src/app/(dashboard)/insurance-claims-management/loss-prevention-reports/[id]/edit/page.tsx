import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getLossPreventionReport } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

const fields: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
      { value: "vessel_specific", label: "Vessel Specific" },
      { value: "incident_analysis", label: "Incident Analysis" },
      { value: "trend_report", label: "Trend Report" },
      { value: "audit", label: "Audit" },
    ],
  },
  { name: "reportTitle", label: "Report Title", type: "text", required: true },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  {
    name: "fleetScope",
    label: "Fleet Scope",
    type: "select",
    options: [
      { value: "single_vessel", label: "Single Vessel" },
      { value: "fleet", label: "Fleet" },
      { value: "all", label: "All" },
    ],
  },
  { name: "totalClaims", label: "Total Claims", type: "number" },
  { name: "totalClaimAmount", label: "Total Claim Amount", type: "text" },
  { name: "totalRecovered", label: "Total Recovered", type: "text" },
  { name: "netLoss", label: "Net Loss", type: "text" },
  { name: "reportCurrency", label: "Report Currency", type: "text" },
  { name: "lossRatio", label: "Loss Ratio", type: "text" },
  { name: "claimFrequency", label: "Claim Frequency", type: "text" },
  { name: "recommendations", label: "Recommendations", type: "textarea" },
  { name: "documentUrl", label: "Document URL", type: "text" },
  {
    name: "documentFormat",
    label: "Document Format",
    type: "select",
    options: [
      { value: "pdf", label: "PDF" },
      { value: "docx", label: "DOCX" },
      { value: "xlsx", label: "XLSX" },
    ],
  },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvedAt", label: "Approved At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLossPreventionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getLossPreventionReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/loss-prevention-reports/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <BarChart3 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Loss Prevention Report</h1>
          <p className="text-sm text-muted-foreground">
            Update loss prevention report record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Loss Prevention Report"
        apiPath={`/api/v1/insurance-claims-management/loss-prevention-reports/${id}`}
        fields={fields}
        initialData={{
          reportType: record.reportType ?? "",
          reportTitle: record.reportTitle ?? "",
          periodStart: record.periodStart?.toISOString() ?? "",
          periodEnd: record.periodEnd?.toISOString() ?? "",
          vesselName: record.vesselName ?? "",
          fleetScope: record.fleetScope ?? "",
          totalClaims: record.totalClaims ?? "",
          totalClaimAmount: record.totalClaimAmount ?? "",
          totalRecovered: record.totalRecovered ?? "",
          netLoss: record.netLoss ?? "",
          reportCurrency: record.reportCurrency ?? "",
          lossRatio: record.lossRatio ?? "",
          claimFrequency: record.claimFrequency ?? "",
          recommendations: record.recommendations ?? "",
          documentUrl: record.documentUrl ?? "",
          documentFormat: record.documentFormat ?? "",
          approvedBy: record.approvedBy ?? "",
          approvedAt: record.approvedAt?.toISOString() ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/loss-prevention-reports/${id}`}
      />
    </div>
  );
}
