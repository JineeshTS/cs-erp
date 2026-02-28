import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FIELDS: FieldConfig[] = [
  {
    name: "policyCode",
    label: "Policy Code",
    type: "text",
    required: true,
    placeholder: "SLA-001",
  },
  {
    name: "policyName",
    label: "Policy Name",
    type: "text",
    required: true,
    placeholder: "Standard Inquiry SLA",
  },
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
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    name: "responseTimeHours",
    label: "Response Time (hours)",
    type: "number",
    required: true,
    placeholder: "4",
  },
  {
    name: "resolutionTimeHours",
    label: "Resolution Time (hours)",
    type: "number",
    required: true,
    placeholder: "24",
  },
  {
    name: "escalationAfterHours",
    label: "Escalation After (hours)",
    type: "number",
    placeholder: "8",
  },
  {
    name: "businessHoursOnly",
    label: "Business Hours Only",
    type: "checkbox",
  },
  {
    name: "isActive",
    label: "Active",
    type: "checkbox",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe this SLA policy...",
  },
];

export default async function NewSLAPolicyPage() {
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
          href="/customer-service-operations/sla-policies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New SLA Policy</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="SLA Policy"
          apiPath="/api/v1/customer-service-operations/sla-policies"
          fields={FIELDS}
          returnPath="/customer-service-operations/sla-policies"
        />
      </div>
    </div>
  );
}
