import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getPortOptions } from "@/lib/lookups";

export default async function NewSchedulePerformancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  const portOpts = await getPortOptions(session.tenantId);

  const FIELDS: FieldConfig[] = [
    {
      name: "vesselScheduleId",
      label: "Vessel Schedule ID",
      type: "text",
    },
    {
      name: "portRotationId",
      label: "Port Rotation ID",
      type: "text",
    },
    {
      name: "portName",
      label: "Port Name",
      type: "select", options: portOpts,
    },
    {
      name: "scheduledArrival",
      label: "Scheduled Arrival",
      type: "datetime-local",
    },
    {
      name: "actualArrival",
      label: "Actual Arrival",
      type: "datetime-local",
    },
    {
      name: "scheduledDeparture",
      label: "Scheduled Departure",
      type: "datetime-local",
    },
    {
      name: "actualDeparture",
      label: "Actual Departure",
      type: "datetime-local",
    },
    {
      name: "arrivalDelayHours",
      label: "Arrival Delay (hrs)",
      type: "number",
    },
    {
      name: "departureDelayHours",
      label: "Departure Delay (hrs)",
      type: "number",
    },
    {
      name: "delayReason",
      label: "Delay Reason",
      type: "text",
    },
    {
      name: "onTimeArrival",
      label: "On Time Arrival",
      type: "checkbox",
    },
    {
      name: "onTimeDeparture",
      label: "On Time Departure",
      type: "checkbox",
    },
    {
      name: "bunkerConsumptionMt",
      label: "Bunker Consumption (MT)",
      type: "number",
    },
    {
      name: "speedKnots",
      label: "Speed (Knots)",
      type: "number",
    },
    {
      name: "distanceNm",
      label: "Distance (NM)",
      type: "number",
    },
    {
      name: "weatherConditions",
      label: "Weather Conditions",
      type: "text",
    },
    {
      name: "seaState",
      label: "Sea State",
      type: "text",
    },
    {
      name: "reliabilityScore",
      label: "Reliability Score",
      type: "number",
    },
    {
      name: "periodFrom",
      label: "Period From",
      type: "datetime-local",
    },
    {
      name: "periodTo",
      label: "Period To",
      type: "datetime-local",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "recorded", label: "Recorded" },
        { value: "verified", label: "Verified" },
        { value: "published", label: "Published" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/schedule-performances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Schedule Performance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Schedule Performance"
          apiPath="/api/v1/capacity-voyage-management/schedule-performances"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/schedule-performances"
        />
      </div>
    </div>
  );
}
