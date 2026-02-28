import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FIELDS: FieldConfig[] = [
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "inquiry", label: "Inquiry" },
      { value: "complaint", label: "Complaint" },
      { value: "service_request", label: "Service Request" },
    ],
  },
  {
    name: "entityId",
    label: "Entity ID",
    type: "text",
    required: true,
    placeholder: "UUID of related entity",
  },
  {
    name: "escalationLevel",
    label: "Escalation Level",
    type: "number",
    placeholder: "1",
  },
  {
    name: "reason",
    label: "Reason",
    type: "textarea",
    required: true,
    placeholder: "Describe the reason for escalation...",
  },
  {
    name: "escalatedBy",
    label: "Escalated By",
    type: "text",
    required: true,
    placeholder: "UUID of escalating user",
  },
  {
    name: "escalatedTo",
    label: "Escalated To",
    type: "text",
    placeholder: "UUID of target user",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "acknowledged", label: "Acknowledged" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
    ],
  },
  {
    name: "responseNotes",
    label: "Response Notes",
    type: "textarea",
    placeholder: "Notes on escalation response...",
  },
];

export default async function NewEscalationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "customer_service:create"
    ))
  )
    redirect("/customer-service-operations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-service-operations/escalations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Escalation</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Escalation"
          apiPath="/api/v1/customer-service-operations/escalations"
          fields={FIELDS}
          returnPath="/customer-service-operations/escalations"
        />
      </div>
    </div>
  );
}
