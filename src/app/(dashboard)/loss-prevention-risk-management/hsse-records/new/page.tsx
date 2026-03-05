import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const HSSE_RECORD_FIELDS: FieldConfig[] = [
  {
    name: "hsseType",
    label: "HSSE Type",
    type: "select",
    required: true,
    options: [
      { value: "safety_audit", label: "Safety Audit" },
      { value: "health_check", label: "Health Check" },
      { value: "security_drill", label: "Security Drill" },
      { value: "environmental_review", label: "Environmental Review" },
      { value: "toolbox_talk", label: "Toolbox Talk" },
      { value: "permit_to_work", label: "Permit To Work" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "locationName", label: "Location Name", type: "text" },
  { name: "conductedBy", label: "Conducted By", type: "text" },
  { name: "conductedDate", label: "Conducted Date", type: "datetime-local" },
  { name: "findingsCount", label: "Findings Count", type: "number" },
  { name: "criticalFindings", label: "Critical Findings", type: "number" },
  { name: "correctiveActions", label: "Corrective Actions", type: "textarea" },
  { name: "nextDueDate", label: "Next Due Date", type: "datetime-local" },
  { name: "isCompliant", label: "Is Compliant", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewHsseRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lpr:create"))
  )
    redirect("/loss-prevention-risk-management/hsse-records");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/hsse-records"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New HSSE Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="HSSE Record"
          apiPath="/api/v1/loss-prevention-risk-management/hsse-records"
          fields={HSSE_RECORD_FIELDS}
          returnPath="/loss-prevention-risk-management/hsse-records"
        />
      </div>
    </div>
  );
}
