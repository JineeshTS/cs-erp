import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewSlaDefinitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sla:create")))
    redirect("/workflow-notification-engine/sla-definitions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/sla-definitions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New SLA Definition
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="SLA Definition"
          apiPath="/api/v1/workflow-notification-engine/sla-definitions"
          fields={SLA_FIELDS}
          returnPath="/workflow-notification-engine/sla-definitions"
        />
      </div>
    </div>
  );
}
