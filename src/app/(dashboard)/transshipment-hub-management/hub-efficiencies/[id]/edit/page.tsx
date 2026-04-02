import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHubEfficiency } from "@/lib/transshipment-hub-management/service";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";

const HUB_EFFICIENCY_FIELDS: FieldConfig[] = [
  {
    name: "efficiencyType",
    label: "Efficiency Type",
    type: "select",
    required: true,
    options: [
      { value: "throughput_analysis", label: "Throughput Analysis" },
      { value: "dwell_time_report", label: "Dwell Time Report" },
      { value: "crane_productivity", label: "Crane Productivity" },
      { value: "berth_utilization", label: "Berth Utilization" },
      { value: "yard_capacity", label: "Yard Capacity" },
    ],
  },
  { name: "hubPort", label: "Hub Port", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "throughputTeu", label: "Throughput TEU", type: "text" },
  { name: "avgDwellHours", label: "Avg Dwell Hours", type: "text" },
  { name: "craneMovesPerHour", label: "Crane Moves/Hour", type: "text" },
  { name: "berthUtilizationPct", label: "Berth Utilization %", type: "text" },
  { name: "yardOccupancyPct", label: "Yard Occupancy %", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditHubEfficiencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:edit")))
    redirect("/transshipment-hub-management/hub-efficiencies");

  const { id } = await params;

  const record = await getHubEfficiency(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/transshipment-hub-management/hub-efficiencies/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Hub Efficiency
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Hub Efficiency"
          apiPath={`/api/v1/transshipment-hub-management/hub-efficiencies/${id}`}
          fields={HUB_EFFICIENCY_FIELDS}
          initialData={{
            efficiencyType: record.efficiencyType,
            hubPort: record.hubPort ?? "",
            periodStart: record.periodStart ? record.periodStart.toISOString().slice(0, 16) : "",
            periodEnd: record.periodEnd ? record.periodEnd.toISOString().slice(0, 16) : "",
            throughputTeu: record.throughputTeu ?? "",
            avgDwellHours: record.avgDwellHours ?? "",
            craneMovesPerHour: record.craneMovesPerHour ?? "",
            berthUtilizationPct: record.berthUtilizationPct ?? "",
            yardOccupancyPct: record.yardOccupancyPct ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/transshipment-hub-management/hub-efficiencies/${id}`}
        />
      </div>
    </div>
  );
}
