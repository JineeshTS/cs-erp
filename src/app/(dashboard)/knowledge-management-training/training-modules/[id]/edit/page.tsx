import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTrainingModule } from "@/lib/knowledge-management-training/service";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const MODULE_FIELDS: FieldConfig[] = [
  { name: "moduleType", label: "Module Type", type: "select", required: true, options: [
    { value: "e_learning", label: "E-Learning" },
    { value: "classroom", label: "Classroom" },
    { value: "blended", label: "Blended" },
    { value: "on_the_job", label: "On the Job" },
    { value: "certification_prep", label: "Certification Prep" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "department", label: "Department", type: "text" },
  { name: "durationHours", label: "Duration (Hours)", type: "number" },
  { name: "maxParticipants", label: "Max Participants", type: "number" },
  { name: "passingScorePct", label: "Passing Score (%)", type: "number" },
  { name: "isMandatory", label: "Is Mandatory", type: "checkbox" },
  { name: "validityMonths", label: "Validity (Months)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTrainingModulePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:edit")))
    redirect("/knowledge-management-training/training-modules");

  const { id } = await params;
  const record = await getTrainingModule(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/knowledge-management-training/training-modules/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Training Module</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <KmtForm entityType="Training Module" apiPath={`/api/v1/knowledge-management-training/training-modules/${id}`} fields={MODULE_FIELDS}
          initialData={{
            moduleType: record.moduleType,
            title: record.title ?? "",
            description: record.description ?? "",
            department: record.department ?? "",
            durationHours: record.durationHours ?? "",
            maxParticipants: record.maxParticipants ?? "",
            passingScorePct: record.passingScorePct ?? "",
            isMandatory: record.isMandatory ?? false,
            validityMonths: record.validityMonths ?? "",
            notes: record.notes ?? "",
          }}
          isEdit returnPath={`/knowledge-management-training/training-modules/${id}`} />
      </div>
    </div>
  );
}
