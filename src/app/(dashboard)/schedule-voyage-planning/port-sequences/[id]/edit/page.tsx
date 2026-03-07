import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortSequence } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditPortSequencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/port-sequences");

  const portOpts = await getPortOptions(session.tenantId);

  const PORT_SEQUENCE_FIELDS: FieldConfig[] = [
    {
      name: "sequenceType",
      label: "Sequence Type",
      type: "select",
      required: true,
      options: [
        { value: "rotation_plan", label: "Rotation Plan" },
        { value: "berth_allocation", label: "Berth Allocation" },
        { value: "window_request", label: "Window Request" },
        { value: "slot_optimization", label: "Slot Optimization" },
        { value: "congestion_bypass", label: "Congestion Bypass" },
      ],
    },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "terminalName", label: "Terminal Name", type: "text" },
    { name: "berthNumber", label: "Berth Number", type: "text" },
    { name: "windowStart", label: "Window Start", type: "datetime-local" },
    { name: "windowEnd", label: "Window End", type: "datetime-local" },
    { name: "sequenceOrder", label: "Sequence Order", type: "number" },
    { name: "dwellHours", label: "Dwell Hours", type: "text" },
    { name: "cargoMovesPlanned", label: "Cargo Moves Planned", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getPortSequence(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/port-sequences/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Port Sequence
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Port Sequence"
          apiPath={`/api/v1/schedule-voyage-planning/port-sequences/${id}`}
          fields={PORT_SEQUENCE_FIELDS}
          initialData={{
            sequenceType: record.sequenceType,
            portCode: record.portCode ?? "",
            portName: record.portName ?? "",
            terminalName: record.terminalName ?? "",
            berthNumber: record.berthNumber ?? "",
            windowStart: record.windowStart ? record.windowStart.toISOString().slice(0, 16) : "",
            windowEnd: record.windowEnd ? record.windowEnd.toISOString().slice(0, 16) : "",
            sequenceOrder: record.sequenceOrder ?? "",
            dwellHours: record.dwellHours ?? "",
            cargoMovesPlanned: record.cargoMovesPlanned ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/port-sequences/${id}`}
        />
      </div>
    </div>
  );
}
