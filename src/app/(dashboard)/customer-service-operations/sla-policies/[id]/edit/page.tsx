import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoSlaPolicies } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FIELDS: FieldConfig[] = [
  {
    name: "policyCode",
    label: "Policy Code",
    type: "text",
    required: true,
  },
  {
    name: "policyName",
    label: "Policy Name",
    type: "text",
    required: true,
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
  },
  {
    name: "resolutionTimeHours",
    label: "Resolution Time (hours)",
    type: "number",
    required: true,
  },
  {
    name: "escalationAfterHours",
    label: "Escalation After (hours)",
    type: "number",
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
  },
];

export default async function EditSLAPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "customer_service:edit"
    ))
  )
    redirect("/customer-service-operations");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoSlaPolicies)
    .where(
      and(
        eq(csoSlaPolicies.id, id),
        eq(csoSlaPolicies.tenantId, session.tenantId),
        isNull(csoSlaPolicies.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    policyCode: record.policyCode,
    policyName: record.policyName,
    entityType: record.entityType,
    priority: record.priority,
    responseTimeHours: record.responseTimeHours,
    resolutionTimeHours: record.resolutionTimeHours,
    escalationAfterHours: record.escalationAfterHours ?? "",
    businessHoursOnly: record.businessHoursOnly,
    isActive: record.isActive,
    description: record.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customer-service-operations/sla-policies/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit SLA Policy</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="SLA Policy"
          apiPath={`/api/v1/customer-service-operations/sla-policies/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/sla-policies/${id}`}
        />
      </div>
    </div>
  );
}
