import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSurveyReport } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditSurveyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit"))) redirect("/login");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "survey", label: "Survey" },
        { value: "inspection", label: "Inspection" },
        { value: "audit", label: "Audit" },
        { value: "certificate", label: "Certificate" },
      ],
    },
    { name: "sourceModule", label: "Source Module", type: "text" },
    { name: "sourceSurveyRef", label: "Source Survey Ref", type: "text" },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
    { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
    { name: "reportDate", label: "Report Date", type: "datetime-local" },
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
    { name: "fileSizeBytes", label: "File Size (bytes)", type: "number" },
    { name: "summary", label: "Summary", type: "textarea" },
    { name: "retentionYears", label: "Retention Years", type: "number" },
    { name: "expiresAt", label: "Expires At", type: "datetime-local" },
    { name: "archivedAt", label: "Archived At", type: "datetime-local" },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "approvedAt", label: "Approved At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getSurveyReport(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string | number | boolean> = {
    reportType: record.reportType ?? "",
    sourceModule: record.sourceModule ?? "",
    sourceSurveyRef: record.sourceSurveyRef ?? "",
    title: record.title ?? "",
    vesselName: record.vesselName ?? "",
    containerNumber: record.containerNumber ?? "",
    surveyorName: record.surveyorName ?? "",
    surveyorCompany: record.surveyorCompany ?? "",
    surveyDate: record.surveyDate?.toISOString() ?? "",
    reportDate: record.reportDate?.toISOString() ?? "",
    documentUrl: record.documentUrl ?? "",
    documentFormat: record.documentFormat ?? "",
    fileSizeBytes: record.fileSizeBytes ?? "",
    summary: record.summary ?? "",
    retentionYears: record.retentionYears ?? "",
    expiresAt: record.expiresAt?.toISOString() ?? "",
    archivedAt: record.archivedAt?.toISOString() ?? "",
    approvedBy: record.approvedBy ?? "",
    approvedAt: record.approvedAt?.toISOString() ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/survey-inspection-management/survey-reports/${record.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit {record.reportRef}</h1>
          <p className="text-sm text-muted-foreground">
            Update survey report details
          </p>
        </div>
      </div>

      <SimForm
        entityType="Survey Report"
        apiPath={`/api/v1/survey-inspection-management/survey-reports/${id}`}
        fields={fields}
        initialData={initialData}
        isEdit
        returnPath={`/survey-inspection-management/survey-reports/${id}`}
      />
    </div>
  );
}
