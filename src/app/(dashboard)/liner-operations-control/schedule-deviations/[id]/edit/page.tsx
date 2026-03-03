import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getScheduleDeviation } from "@/lib/liner-operations-control/service";
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

export default async function EditScheduleDeviationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getScheduleDeviation(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    deviationType: record.deviationType ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    serviceName: record.serviceName ?? "",
    originalEta: record.originalEta
      ? new Date(record.originalEta).toISOString().slice(0, 16)
      : "",
    revisedEta: record.revisedEta
      ? new Date(record.revisedEta).toISOString().slice(0, 16)
      : "",
    delayHours: record.delayHours ?? "",
    deviationReason: record.deviationReason ?? "",
    recoveryPlan: record.recoveryPlan ?? "",
    costImpact: record.costImpact ?? "",
    impactCurrency: record.impactCurrency ?? "",
    affectedPorts: record.affectedPorts != null ? String(record.affectedPorts) : "",
    recoveryAchieved: record.recoveryAchieved ? "true" : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/schedule-deviations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.deviationRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update schedule deviation details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Schedule Deviation"
          apiPath={`/api/v1/liner-operations-control/schedule-deviations/${id}`}
          returnPath="/liner-operations-control/schedule-deviations"
          fields={SCHEDULE_DEVIATION_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
