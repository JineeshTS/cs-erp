import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOperationalEfficiency } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const OPERATIONAL_EFFICIENCY_FIELDS: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    required: true,
    options: [
      { value: "port_turnaround", label: "Port Turnaround" },
      { value: "container_dwell", label: "Container Dwell" },
      { value: "documentation_speed", label: "Documentation Speed" },
      { value: "equipment_utilization", label: "Equipment Utilization" },
    ],
  },
  { name: "entityName", label: "Entity Name", type: "text" },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "vessel", label: "Vessel" },
      { value: "port", label: "Port" },
      { value: "terminal", label: "Terminal" },
      { value: "depot", label: "Depot" },
    ],
  },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  {
    name: "avgTurnaroundHours",
    label: "Avg Turnaround Hours",
    type: "number",
  },
  { name: "avgDwellTimeDays", label: "Avg Dwell Time (Days)", type: "number" },
  {
    name: "avgDocProcessingHours",
    label: "Avg Doc Processing Hours",
    type: "number",
  },
  {
    name: "equipmentUtilizationPct",
    label: "Equipment Utilization %",
    type: "number",
  },
  { name: "berthProductivity", label: "Berth Productivity", type: "number" },
  {
    name: "craneMovesPerHour",
    label: "Crane Moves Per Hour",
    type: "number",
  },
  {
    name: "truckTurnaroundMinutes",
    label: "Truck Turnaround (Minutes)",
    type: "number",
  },
  { name: "incidentCount", label: "Incident Count", type: "number" },
  { name: "delayCount", label: "Delay Count", type: "number" },
  { name: "delayHoursTotal", label: "Delay Hours Total", type: "number" },
  { name: "costPerTeu", label: "Cost Per TEU", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditOperationalEfficiencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/operational-efficiencies");

  const { id } = await params;

  const record = await getOperationalEfficiency(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/operational-efficiencies/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Operational Efficiency
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Operational Efficiency"
          apiPath={`/api/v1/analytics-business-intelligence/operational-efficiencies/${id}`}
          fields={OPERATIONAL_EFFICIENCY_FIELDS}
          initialData={{
            analyticsType: record.analyticsType,
            entityName: record.entityName ?? "",
            entityType: record.entityType ?? "",
            periodStart: record.periodStart
              ? new Date(record.periodStart).toISOString()
              : "",
            periodEnd: record.periodEnd
              ? new Date(record.periodEnd).toISOString()
              : "",
            avgTurnaroundHours: record.avgTurnaroundHours
              ? Number(record.avgTurnaroundHours)
              : "",
            avgDwellTimeDays: record.avgDwellTimeDays
              ? Number(record.avgDwellTimeDays)
              : "",
            avgDocProcessingHours: record.avgDocProcessingHours
              ? Number(record.avgDocProcessingHours)
              : "",
            equipmentUtilizationPct: record.equipmentUtilizationPct
              ? Number(record.equipmentUtilizationPct)
              : "",
            berthProductivity: record.berthProductivity
              ? Number(record.berthProductivity)
              : "",
            craneMovesPerHour: record.craneMovesPerHour
              ? Number(record.craneMovesPerHour)
              : "",
            truckTurnaroundMinutes: record.truckTurnaroundMinutes
              ? Number(record.truckTurnaroundMinutes)
              : "",
            incidentCount: record.incidentCount ?? "",
            delayCount: record.delayCount ?? "",
            delayHoursTotal: record.delayHoursTotal
              ? Number(record.delayHoursTotal)
              : "",
            costPerTeu: record.costPerTeu ? Number(record.costPerTeu) : "",
            currency: record.currency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/operational-efficiencies/${id}`}
        />
      </div>
    </div>
  );
}
