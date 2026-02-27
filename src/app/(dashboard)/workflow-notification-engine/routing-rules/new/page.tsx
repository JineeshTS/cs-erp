import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { WneForm, type FieldConfig } from "@/components/workflow-notification-engine/wne-form";

const ROUTING_RULE_FIELDS: FieldConfig[] = [
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
  { name: "triggerEvent", label: "Trigger Event", type: "text", required: true },
  { name: "priority", label: "Priority", type: "number", placeholder: "0" },
  {
    name: "assignmentType",
    label: "Assignment Type",
    type: "select",
    required: true,
    options: [
      { value: "user", label: "User" },
      { value: "role", label: "Role" },
      { value: "department", label: "Department" },
      { value: "round_robin", label: "Round Robin" },
      { value: "least_loaded", label: "Least Loaded" },
    ],
  },
  { name: "assignmentValue", label: "Assignment Value", type: "text", required: true },
  { name: "fallbackAssignment", label: "Fallback Assignment", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewRoutingRulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "routing:create")))
    redirect("/workflow-notification-engine/routing-rules");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/routing-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Routing Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="Routing Rule"
          apiPath="/api/v1/workflow-notification-engine/routing-rules"
          fields={ROUTING_RULE_FIELDS}
          returnPath="/workflow-notification-engine/routing-rules"
        />
      </div>
    </div>
  );
}
