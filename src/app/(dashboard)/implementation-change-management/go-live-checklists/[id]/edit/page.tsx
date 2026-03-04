import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGoLiveChecklist } from "@/lib/implementation-change-management/service";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const CHECKLIST_FIELDS: FieldConfig[] = [
  { name: "checklistType", label: "Checklist Type", type: "select", required: true, options: [
    { value: "technical_readiness", label: "Technical Readiness" },
    { value: "business_readiness", label: "Business Readiness" },
    { value: "data_readiness", label: "Data Readiness" },
    { value: "training_readiness", label: "Training Readiness" },
    { value: "support_readiness", label: "Support Readiness" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "totalItems", label: "Total Items", type: "number" },
  { name: "completedItems", label: "Completed Items", type: "number" },
  { name: "blockedItems", label: "Blocked Items", type: "number" },
  { name: "goLiveDate", label: "Go-Live Date", type: "datetime-local" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvedDate", label: "Approved Date", type: "datetime-local" },
  { name: "isReady", label: "Is Ready", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditGoLiveChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:edit")))
    redirect("/implementation-change-management/go-live-checklists");

  const { id } = await params;
  const record = await getGoLiveChecklist(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/implementation-change-management/go-live-checklists/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Checklist</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IcmForm entityType="Checklist" apiPath={`/api/v1/implementation-change-management/go-live-checklists/${id}`} fields={CHECKLIST_FIELDS}
          initialData={{
            checklistType: record.checklistType,
            title: record.title ?? "",
            category: record.category ?? "",
            totalItems: record.totalItems ?? "",
            completedItems: record.completedItems ?? "",
            blockedItems: record.blockedItems ?? "",
            goLiveDate: record.goLiveDate ? record.goLiveDate.toISOString().slice(0, 16) : "",
            approvedBy: record.approvedBy ?? "",
            approvedDate: record.approvedDate ? record.approvedDate.toISOString().slice(0, 16) : "",
            isReady: record.isReady ?? false,
            notes: record.notes ?? "",
          }}
          isEdit returnPath={`/implementation-change-management/go-live-checklists/${id}`} />
      </div>
    </div>
  );
}
