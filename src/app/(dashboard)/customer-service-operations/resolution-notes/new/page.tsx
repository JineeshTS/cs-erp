import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewResolutionNotePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations/resolution-notes");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/resolution-notes" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Resolution Note</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Resolution Note"
          apiPath="/api/v1/customer-service-operations/resolution-notes"
          fields={RESOLUTION_NOTE_FIELDS}
          returnPath="/customer-service-operations/resolution-notes"
        />
      </div>
    </div>
  );
}
