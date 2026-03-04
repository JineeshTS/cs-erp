import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

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
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "berthNumber", label: "Berth Number", type: "text" },
  { name: "windowStart", label: "Window Start", type: "datetime-local" },
  { name: "windowEnd", label: "Window End", type: "datetime-local" },
  { name: "sequenceOrder", label: "Sequence Order", type: "number" },
  { name: "dwellHours", label: "Dwell Hours", type: "text" },
  { name: "cargoMovesPlanned", label: "Cargo Moves Planned", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortSequencePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/port-sequences");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/port-sequences"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Sequence
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Port Sequence"
          apiPath="/api/v1/schedule-voyage-planning/port-sequences"
          fields={PORT_SEQUENCE_FIELDS}
          returnPath="/schedule-voyage-planning/port-sequences"
        />
      </div>
    </div>
  );
}
