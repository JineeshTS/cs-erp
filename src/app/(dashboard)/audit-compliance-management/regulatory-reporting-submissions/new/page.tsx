import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewRegulatoryReportingSubmissionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/audit-compliance-management/regulatory-reporting-submissions"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Regulatory Reporting Submission
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Submission"
          apiPath="/api/v1/audit-compliance-management/regulatory-reporting-submissions"
          fields={fields}
          returnPath="/audit-compliance-management/regulatory-reporting-submissions"
        />
      </div>
    </div>
  );
}
