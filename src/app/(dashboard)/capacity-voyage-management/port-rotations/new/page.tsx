import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "portCode",
    label: "Port Code",
    type: "text",
    required: true,
    placeholder: "QADOH",
  },
  {
    name: "portName",
    label: "Port Name",
    type: "text",
    required: true,
    placeholder: "Hamad Port",
  },
  {
    name: "sequenceNumber",
    label: "Sequence Number",
    type: "number",
    required: true,
  },
  {
    name: "arrivalEta",
    label: "Arrival ETA",
    type: "datetime-local",
  },
  {
    name: "departureEtd",
    label: "Departure ETD",
    type: "datetime-local",
  },
  {
    name: "actualArrival",
    label: "Actual Arrival",
    type: "datetime-local",
  },
  {
    name: "actualDeparture",
    label: "Actual Departure",
    type: "datetime-local",
  },
  {
    name: "terminalName",
    label: "Terminal Name",
    type: "text",
  },
  {
    name: "berthName",
    label: "Berth Name",
    type: "text",
  },
  {
    name: "callPurpose",
    label: "Call Purpose",
    type: "select",
    options: [
      { value: "loading", label: "Loading" },
      { value: "discharging", label: "Discharging" },
      { value: "both", label: "Both" },
      { value: "bunker", label: "Bunker" },
      { value: "transit", label: "Transit" },
    ],
  },
  {
    name: "timeZone",
    label: "Time Zone",
    type: "text",
    placeholder: "Asia/Qatar",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "arrived", label: "Arrived" },
      { value: "berthed", label: "Berthed" },
      { value: "departed", label: "Departed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "skipped", label: "Skipped" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewPortRotationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/port-rotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Rotation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Port Rotation"
          apiPath="/api/v1/capacity-voyage-management/port-rotations"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/port-rotations"
        />
      </div>
    </div>
  );
}
