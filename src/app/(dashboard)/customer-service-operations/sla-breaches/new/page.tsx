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
    name: "breachType",
    label: "Breach Type",
    type: "select",
    options: [
      { value: "response_time", label: "Response Time" },
      { value: "resolution_time", label: "Resolution Time" },
    ],
  },
  {
    name: "expectedAt",
    label: "Expected At",
    type: "datetime-local",
    required: true,
  },
  {
    name: "breachedAt",
    label: "Breached At",
    type: "datetime-local",
    required: true,
  },
  {
    name: "overageMinutes",
    label: "Overage (minutes)",
    type: "number",
    placeholder: "30",
  },
  {
    name: "acknowledged",
    label: "Acknowledged",
    type: "checkbox",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes about this breach...",
  },
];

export default async function NewSLABreachPage() {
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
          href="/customer-service-operations/sla-breaches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New SLA Breach</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="SLA Breach"
          apiPath="/api/v1/customer-service-operations/sla-breaches"
          fields={FIELDS}
          returnPath="/customer-service-operations/sla-breaches"
        />
      </div>
    </div>
  );
}
