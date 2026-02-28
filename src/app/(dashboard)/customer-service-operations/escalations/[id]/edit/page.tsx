import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoEscalations } from "@/db/schema";
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
  },
  {
    name: "escalationLevel",
    label: "Escalation Level",
    type: "number",
  },
  {
    name: "reason",
    label: "Reason",
    type: "textarea",
    required: true,
  },
  {
    name: "escalatedBy",
    label: "Escalated By",
    type: "text",
    required: true,
  },
  {
    name: "escalatedTo",
    label: "Escalated To",
    type: "text",
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
  },
];

export default async function EditEscalationPage({
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
    .from(csoEscalations)
    .where(
      and(
        eq(csoEscalations.id, id),
        eq(csoEscalations.tenantId, session.tenantId),
        isNull(csoEscalations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    entityType: record.entityType,
    entityId: record.entityId,
    escalationLevel: record.escalationLevel,
    reason: record.reason,
    escalatedBy: record.escalatedBy,
    escalatedTo: record.escalatedTo ?? "",
    status: record.status,
    responseNotes: record.responseNotes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customer-service-operations/escalations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Escalation</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Escalation"
          apiPath={`/api/v1/customer-service-operations/escalations/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/escalations/${id}`}
        />
      </div>
    </div>
  );
}
