import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHsseRecord } from "@/lib/loss-prevention-risk-management/service";
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

export default async function EditHsseRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/hsse-records");

  const { id } = await params;

  const record = await getHsseRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/hsse-records/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit HSSE Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="HSSE Record"
          apiPath={`/api/v1/loss-prevention-risk-management/hsse-records/${id}`}
          fields={HSSE_RECORD_FIELDS}
          initialData={{
            hsseType: record.hsseType,
            title: record.title ?? "",
            vesselName: record.vesselName ?? "",
            locationName: record.locationName ?? "",
            conductedBy: record.conductedBy ?? "",
            conductedDate: record.conductedDate ? record.conductedDate.toISOString().slice(0, 16) : "",
            findingsCount: record.findingsCount ?? "",
            criticalFindings: record.criticalFindings ?? "",
            correctiveActions: record.correctiveActions ?? "",
            nextDueDate: record.nextDueDate ? record.nextDueDate.toISOString().slice(0, 16) : "",
            isCompliant: record.isCompliant ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/hsse-records/${id}`}
        />
      </div>
    </div>
  );
}
