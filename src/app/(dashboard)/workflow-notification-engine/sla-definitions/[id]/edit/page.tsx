import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { wneSlaDefinitions } from "@/db/schema";
import { WneForm, type FieldConfig } from "@/components/workflow-notification-engine/wne-form";

const SLA_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
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
    placeholder: "e.g. booking.created",
  },
  { name: "targetHours", label: "Target Hours", type: "number", required: true },
  { name: "warningHours", label: "Warning Hours", type: "number", required: true },
  { name: "criticalHours", label: "Critical Hours", type: "number", required: true },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function EditSlaDefinitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sla:edit")))
    redirect("/workflow-notification-engine/sla-definitions");

  const { id } = await params;

  const sla = await db
    .select()
    .from(wneSlaDefinitions)
    .where(
      and(
        eq(wneSlaDefinitions.id, id),
        eq(wneSlaDefinitions.tenantId, session.tenantId),
        isNull(wneSlaDefinitions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sla) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/workflow-notification-engine/sla-definitions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit SLA Definition
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="SLA Definition"
          apiPath={`/api/v1/workflow-notification-engine/sla-definitions/${id}`}
          fields={SLA_FIELDS}
          initialData={{
            name: sla.name,
            entityType: sla.entityType,
            triggerEvent: sla.triggerEvent,
            targetHours: Number(sla.targetHours),
            warningHours: Number(sla.warningHours),
            criticalHours: Number(sla.criticalHours),
            priority: sla.priority,
            isActive: sla.isActive,
          }}
          isEdit
          returnPath={`/workflow-notification-engine/sla-definitions/${id}`}
        />
      </div>
    </div>
  );
}
