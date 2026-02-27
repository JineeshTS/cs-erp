import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { WneForm } from "@/components/workflow-notification-engine/wne-form";
import type { FieldConfig } from "@/components/workflow-notification-engine/wne-form";

const WORKFLOW_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    required: true,
    options: [
      { value: "booking", label: "Booking" },
      { value: "invoice", label: "Invoice" },
      { value: "shipment", label: "Shipment" },
      { value: "customs_declaration", label: "Customs Declaration" },
      { value: "payment", label: "Payment" },
    ],
  },
  {
    name: "triggerEvent",
    label: "Trigger Event",
    type: "text",
    required: true,
    placeholder: "e.g. booking.created, invoice.approved",
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewWorkflowPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "workflows:create"))
  )
    redirect("/workflow-notification-engine/workflows");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Workflow</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="Workflow"
          apiPath="/api/v1/workflow-notification-engine/workflows"
          fields={WORKFLOW_FIELDS}
          returnPath="/workflow-notification-engine/workflows"
        />
      </div>
    </div>
  );
}
