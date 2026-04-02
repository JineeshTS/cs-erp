import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const FIELDS: FieldConfig[] = [
  {
    name: "movementReference",
    label: "Movement Reference",
    type: "text",
    required: true,
  },
  {
    name: "movementType",
    label: "Movement Type",
    type: "select",
    required: true,
    options: [
      { value: "gate_in", label: "Gate In" },
      { value: "gate_out", label: "Gate Out" },
    ],
  },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  { name: "vehiclePlate", label: "Vehicle Plate", type: "text" },
  { name: "driverName", label: "Driver Name", type: "text" },
  { name: "transportCompany", label: "Transport Company", type: "text" },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "vgmWeightKg", label: "VGM Weight (kg)", type: "number" },
  { name: "gateCode", label: "Gate Code", type: "text" },
  { name: "laneNumber", label: "Lane Number", type: "text" },
  {
    name: "inspectionResult",
    label: "Inspection Result",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "passed", label: "Passed" },
      { value: "failed", label: "Failed" },
    ],
  },
  { name: "codecoMessageId", label: "CODECO Message ID", type: "text" },
  { name: "ediReference", label: "EDI Reference", type: "text" },
  {
    name: "movementTimestamp",
    label: "Movement Timestamp",
    type: "datetime-local",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewGateMovementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "equipment:create"))
  )
    redirect("/equipment-control-yard-managem");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/gate-movements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Gate Movement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Gate Movement"
          apiPath="/api/v1/equipment-control-yard-managem/gate-movements"
          fields={FIELDS}
          returnPath="/equipment-control-yard-managem/gate-movements"
        />
      </div>
    </div>
  );
}
