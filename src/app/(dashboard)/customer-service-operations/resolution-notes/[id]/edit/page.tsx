import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoResolutionNotes } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const RESOLUTION_NOTE_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "select", options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true, placeholder: "Enter entity ID" },
  { name: "noteType", label: "Note Type", type: "select", options: [
    { value: "internal", label: "Internal" },
    { value: "customer_visible", label: "Customer Visible" },
    { value: "system", label: "System" },
  ]},
  { name: "content", label: "Content", type: "textarea", required: true },
  { name: "createdBy", label: "Created By", type: "text", required: true, placeholder: "Enter creator ID" },
  { name: "isInternal", label: "Internal", type: "checkbox" },
];

export default async function EditResolutionNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/resolution-notes");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoResolutionNotes)
    .where(
      and(
        eq(csoResolutionNotes.id, id),
        eq(csoResolutionNotes.tenantId, session.tenantId),
        isNull(csoResolutionNotes.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    entityType: record.entityType,
    entityId: record.entityId,
    noteType: record.noteType,
    content: record.content,
    createdBy: record.createdBy,
    isInternal: record.isInternal,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/resolution-notes/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Resolution Note</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Resolution Note"
          apiPath={`/api/v1/customer-service-operations/resolution-notes/${id}`}
          fields={RESOLUTION_NOTE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/resolution-notes/${id}`}
        />
      </div>
    </div>
  );
}
