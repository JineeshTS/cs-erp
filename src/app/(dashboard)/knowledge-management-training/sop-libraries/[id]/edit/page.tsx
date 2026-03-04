import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSopLibrary } from "@/lib/knowledge-management-training/service";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const SOP_FIELDS: FieldConfig[] = [
  { name: "sopType", label: "SOP Type", type: "select", required: true, options: [
    { value: "operational_procedure", label: "Operational Procedure" },
    { value: "safety_manual", label: "Safety Manual" },
    { value: "compliance_guide", label: "Compliance Guide" },
    { value: "work_instruction", label: "Work Instruction" },
    { value: "policy_document", label: "Policy Document" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "versionNumber", label: "Version Number", type: "text" },
  { name: "effectiveDate", label: "Effective Date", type: "datetime-local" },
  { name: "reviewDate", label: "Review Date", type: "datetime-local" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "documentUrl", label: "Document URL", type: "text" },
  { name: "isActive", label: "Is Active", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSopLibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:edit")))
    redirect("/knowledge-management-training/sop-libraries");

  const { id } = await params;
  const record = await getSopLibrary(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/knowledge-management-training/sop-libraries/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit SOP</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <KmtForm entityType="SOP" apiPath={`/api/v1/knowledge-management-training/sop-libraries/${id}`} fields={SOP_FIELDS}
          initialData={{
            sopType: record.sopType,
            title: record.title ?? "",
            department: record.department ?? "",
            category: record.category ?? "",
            versionNumber: record.versionNumber ?? "",
            effectiveDate: record.effectiveDate ? record.effectiveDate.toISOString().slice(0, 16) : "",
            reviewDate: record.reviewDate ? record.reviewDate.toISOString().slice(0, 16) : "",
            approvedBy: record.approvedBy ?? "",
            documentUrl: record.documentUrl ?? "",
            isActive: record.isActive ?? false,
            notes: record.notes ?? "",
          }}
          isEdit returnPath={`/knowledge-management-training/sop-libraries/${id}`} />
      </div>
    </div>
  );
}
