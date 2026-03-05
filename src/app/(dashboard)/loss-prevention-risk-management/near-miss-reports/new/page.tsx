import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewNearMissReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lpr:create"))
  )
    redirect("/loss-prevention-risk-management/near-miss-reports");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/near-miss-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Near Miss Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Near Miss Report"
          apiPath="/api/v1/loss-prevention-risk-management/near-miss-reports"
          fields={NEAR_MISS_REPORT_FIELDS}
          returnPath="/loss-prevention-risk-management/near-miss-reports"
        />
      </div>
    </div>
  );
}
