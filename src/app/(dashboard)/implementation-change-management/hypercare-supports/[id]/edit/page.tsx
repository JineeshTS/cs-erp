import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHypercareSupport } from "@/lib/implementation-change-management/service";
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

export default async function EditHypercareSupportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:edit")))
    redirect("/implementation-change-management/hypercare-supports");

  const { id } = await params;

  const record = await getHypercareSupport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/implementation-change-management/hypercare-supports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Hypercare Support
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcmForm
          entityType="Hypercare Support"
          apiPath={`/api/v1/implementation-change-management/hypercare-supports/${id}`}
          fields={HYPERCARE_SUPPORT_FIELDS}
          initialData={{
            supportType: record.supportType,
            title: record.title ?? "",
            reportedBy: record.reportedBy ?? "",
            department: record.department ?? "",
            severity: record.severity ?? "",
            module: record.module ?? "",
            description: record.description ?? "",
            resolution: record.resolution ?? "",
            assignedTo: record.assignedTo ?? "",
            reportedDate: record.reportedDate ? record.reportedDate.toISOString().slice(0, 16) : "",
            resolvedDate: record.resolvedDate ? record.resolvedDate.toISOString().slice(0, 16) : "",
            slaBreached: record.slaBreached ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/implementation-change-management/hypercare-supports/${id}`}
        />
      </div>
    </div>
  );
}
