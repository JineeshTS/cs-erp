import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const REPOSITIONING_FIELDS: FieldConfig[] = [
  {
    name: "planReference",
    label: "Plan Reference",
    type: "text",
    required: true,
    placeholder: "RP-2026-001",
  },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    placeholder: "ABCU1234567",
  },
  {
    name: "fromPort",
    label: "From Port",
    type: "text",
    required: true,
    placeholder: "QAHMD",
  },
  {
    name: "toPort",
    label: "To Port",
    type: "text",
    required: true,
    placeholder: "AEJEA",
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "USD", label: "USD" },
      { value: "QAR", label: "QAR" },
      { value: "AED", label: "AED" },
      { value: "SAR", label: "SAR" },
      { value: "INR", label: "INR" },
    ],
  },
  {
    name: "transportMode",
    label: "Transport Mode",
    type: "select",
    options: [
      { value: "vessel", label: "Vessel" },
      { value: "truck", label: "Truck" },
      { value: "rail", label: "Rail" },
      { value: "barge", label: "Barge" },
    ],
  },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "completedDate", label: "Completed Date", type: "datetime-local" },
  {
    name: "reason",
    label: "Reason",
    type: "select",
    options: [
      { value: "surplus", label: "Surplus" },
      { value: "demand", label: "Demand" },
      { value: "repositioning", label: "Repositioning" },
      { value: "repair", label: "Repair" },
    ],
  },
  { name: "containerType", label: "Container Type", type: "text" },
  {
    name: "containerSize",
    label: "Container Size",
    type: "select",
    options: [
      { value: "20", label: "20ft" },
      { value: "40", label: "40ft" },
      { value: "45", label: "45ft" },
    ],
  },
  { name: "quantity", label: "Quantity", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "approved", label: "Approved" },
      { value: "in_transit", label: "In Transit" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRepositioningPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "equipment:create"))
  )
    redirect("/equipment-control-yard-managem/repositioning-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/repositioning-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Repositioning Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Repositioning Plan"
          apiPath="/api/v1/equipment-control-yard-managem/repositioning-plans"
          fields={REPOSITIONING_FIELDS}
          returnPath="/equipment-control-yard-managem/repositioning-plans"
        />
      </div>
    </div>
  );
}
