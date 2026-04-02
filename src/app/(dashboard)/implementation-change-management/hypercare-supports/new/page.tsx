import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const HYPERCARE_SUPPORT_FIELDS: FieldConfig[] = [
  {
    name: "supportType",
    label: "Support Type",
    type: "select",
    required: true,
    options: [
      { value: "incident_response", label: "Incident Response" },
      { value: "performance_tuning", label: "Performance Tuning" },
      { value: "user_assistance", label: "User Assistance" },
      { value: "bug_resolution", label: "Bug Resolution" },
      { value: "data_correction", label: "Data Correction" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "reportedBy", label: "Reported By", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "severity", label: "Severity", type: "text" },
  { name: "module", label: "Module", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "resolution", label: "Resolution", type: "textarea" },
  { name: "assignedTo", label: "Assigned To", type: "text" },
  { name: "reportedDate", label: "Reported Date", type: "datetime-local" },
  { name: "resolvedDate", label: "Resolved Date", type: "datetime-local" },
  { name: "slaBreached", label: "SLA Breached", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewHypercareSupportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "icm:create"))
  )
    redirect("/implementation-change-management/hypercare-supports");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/implementation-change-management/hypercare-supports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Hypercare Support
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcmForm
          entityType="Hypercare Support"
          apiPath="/api/v1/implementation-change-management/hypercare-supports"
          fields={HYPERCARE_SUPPORT_FIELDS}
          returnPath="/implementation-change-management/hypercare-supports"
        />
      </div>
    </div>
  );
}
