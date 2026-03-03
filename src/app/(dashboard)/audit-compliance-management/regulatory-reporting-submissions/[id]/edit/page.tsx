import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRegulatoryReportingSubmission } from "@/lib/audit-compliance-management/service";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "submissionType",
    label: "Submission Type",
    type: "select",
    required: true,
    options: [
      { value: "annual_report", label: "Annual Report" },
      { value: "quarterly_filing", label: "Quarterly Filing" },
      { value: "incident_report", label: "Incident Report" },
      { value: "statistical_report", label: "Statistical Report" },
      { value: "customs_report", label: "Customs Report" },
      { value: "tax_filing", label: "Tax Filing" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "regulation", label: "Regulation", type: "text" },
  { name: "authority", label: "Authority", type: "text" },
  { name: "jurisdiction", label: "Jurisdiction", type: "text" },
  {
    name: "reportingPeriodStart",
    label: "Reporting Period Start",
    type: "datetime-local",
  },
  {
    name: "reportingPeriodEnd",
    label: "Reporting Period End",
    type: "datetime-local",
  },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  {
    name: "submissionDate",
    label: "Submission Date",
    type: "datetime-local",
  },
  { name: "submissionFormat", label: "Submission Format", type: "text" },
  { name: "submissionChannel", label: "Submission Channel", type: "text" },
  { name: "preparedBy", label: "Prepared By", type: "text" },
  { name: "reviewedBy", label: "Reviewed By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRegulatoryReportingSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getRegulatoryReportingSubmission(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/audit-compliance-management/regulatory-reporting-submissions/${id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Regulatory Reporting Submission
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Submission"
          apiPath={`/api/v1/audit-compliance-management/regulatory-reporting-submissions/${id}`}
          fields={fields}
          initialData={{
            submissionType: record.submissionType,
            title: record.title,
            regulation: record.regulation ?? "",
            authority: record.authority ?? "",
            jurisdiction: record.jurisdiction ?? "",
            reportingPeriodStart: record.reportingPeriodStart
              ? record.reportingPeriodStart.toISOString()
              : "",
            reportingPeriodEnd: record.reportingPeriodEnd
              ? record.reportingPeriodEnd.toISOString()
              : "",
            dueDate: record.dueDate ? record.dueDate.toISOString() : "",
            submissionDate: record.submissionDate
              ? record.submissionDate.toISOString()
              : "",
            submissionFormat: record.submissionFormat ?? "",
            submissionChannel: record.submissionChannel ?? "",
            preparedBy: record.preparedBy ?? "",
            reviewedBy: record.reviewedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/audit-compliance-management/regulatory-reporting-submissions/${id}`}
        />
      </div>
    </div>
  );
}
