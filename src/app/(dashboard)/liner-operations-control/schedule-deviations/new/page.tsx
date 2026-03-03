import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const SCHEDULE_DEVIATION_FIELDS: FieldConfig[] = [
  {
    name: "deviationType",
    label: "Deviation Type",
    type: "select",
    required: true,
    options: [
      { value: "port_omission", label: "Port Omission" },
      { value: "schedule_delay", label: "Schedule Delay" },
      { value: "speed_change", label: "Speed Change" },
      { value: "bunker_diversion", label: "Bunker Diversion" },
      { value: "weather_routing", label: "Weather Routing" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "originalEta", label: "Original ETA", type: "datetime-local" },
  { name: "revisedEta", label: "Revised ETA", type: "datetime-local" },
  { name: "delayHours", label: "Delay Hours", type: "number" },
  { name: "deviationReason", label: "Deviation Reason", type: "textarea" },
  { name: "recoveryPlan", label: "Recovery Plan", type: "textarea" },
  { name: "costImpact", label: "Cost Impact", type: "number" },
  { name: "impactCurrency", label: "Impact Currency", type: "text" },
  { name: "affectedPorts", label: "Affected Ports", type: "number" },
  {
    name: "recoveryAchieved",
    label: "Recovery Achieved",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewScheduleDeviationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/liner-operations-control/schedule-deviations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Schedule Deviation
          </h1>
          <p className="text-sm text-muted-foreground">
            Record a new schedule deviation event
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Schedule Deviation"
          apiPath="/api/v1/liner-operations-control/schedule-deviations"
          returnPath="/liner-operations-control/schedule-deviations"
          fields={SCHEDULE_DEVIATION_FIELDS}
        />
      </div>
    </div>
  );
}
