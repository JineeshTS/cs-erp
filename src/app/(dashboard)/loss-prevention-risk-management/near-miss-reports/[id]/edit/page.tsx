import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getNearMissReport } from "@/lib/loss-prevention-risk-management/service";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const NEAR_MISS_REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "near_miss", label: "Near Miss" },
      { value: "unsafe_act", label: "Unsafe Act" },
      { value: "unsafe_condition", label: "Unsafe Condition" },
      { value: "good_catch", label: "Good Catch" },
      { value: "hazard_observation", label: "Hazard Observation" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "locationName", label: "Location Name", type: "text" },
  { name: "reportedBy", label: "Reported By", type: "text" },
  { name: "reportedDate", label: "Reported Date", type: "datetime-local" },
  {
    name: "potentialSeverity",
    label: "Potential Severity",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "immediateAction", label: "Immediate Action", type: "textarea" },
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "preventiveMeasure", label: "Preventive Measure", type: "textarea" },
  { name: "isAnonymous", label: "Anonymous Report", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditNearMissReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/near-miss-reports");

  const { id } = await params;

  const record = await getNearMissReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/near-miss-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Near Miss Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Near Miss Report"
          apiPath={`/api/v1/loss-prevention-risk-management/near-miss-reports/${id}`}
          fields={NEAR_MISS_REPORT_FIELDS}
          initialData={{
            reportType: record.reportType,
            title: record.title ?? "",
            vesselName: record.vesselName ?? "",
            locationName: record.locationName ?? "",
            reportedBy: record.reportedBy ?? "",
            reportedDate: record.reportedDate ? record.reportedDate.toISOString().slice(0, 16) : "",
            potentialSeverity: record.potentialSeverity ?? "",
            description: record.description ?? "",
            immediateAction: record.immediateAction ?? "",
            rootCause: record.rootCause ?? "",
            preventiveMeasure: record.preventiveMeasure ?? "",
            isAnonymous: record.isAnonymous ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/near-miss-reports/${id}`}
        />
      </div>
    </div>
  );
}
