import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyGateMovements } from "@/db/schema";
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

export default async function EditGateMovementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const gm = await db
    .select()
    .from(eqyGateMovements)
    .where(
      and(
        eq(eqyGateMovements.id, id),
        eq(eqyGateMovements.tenantId, session.tenantId),
        isNull(eqyGateMovements.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!gm) notFound();

  const initialData: Record<string, unknown> = {
    movementReference: gm.movementReference,
    movementType: gm.movementType,
    containerNumber: gm.containerNumber,
    containerFleetId: gm.containerFleetId ?? "",
    vehiclePlate: gm.vehiclePlate ?? "",
    driverName: gm.driverName ?? "",
    transportCompany: gm.transportCompany ?? "",
    sealNumber: gm.sealNumber ?? "",
    vgmWeightKg: gm.vgmWeightKg != null ? Number(gm.vgmWeightKg) : "",
    gateCode: gm.gateCode ?? "",
    laneNumber: gm.laneNumber ?? "",
    inspectionResult: gm.inspectionResult ?? "",
    codecoMessageId: gm.codecoMessageId ?? "",
    ediReference: gm.ediReference ?? "",
    movementTimestamp: gm.movementTimestamp
      ? gm.movementTimestamp.toISOString()
      : "",
    status: gm.status,
    notes: gm.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/gate-movements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Gate Movement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Gate Movement"
          apiPath={`/api/v1/equipment-control-yard-managem/gate-movements/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/gate-movements/${id}`}
        />
      </div>
    </div>
  );
}
