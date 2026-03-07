import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCargoPlan } from "@/lib/transshipment-hub-management/service";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditCargoPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:edit")))
    redirect("/transshipment-hub-management/cargo-plans");

  const portOpts = await getPortOptions(session.tenantId);

  const CARGO_PLAN_FIELDS: FieldConfig[] = [
    {
      name: "planType",
      label: "Plan Type",
      type: "select",
      required: true,
      options: [
        { value: "inbound_planning", label: "Inbound Planning" },
        { value: "outbound_planning", label: "Outbound Planning" },
        { value: "cross_dock", label: "Cross Dock" },
        { value: "consolidation", label: "Consolidation" },
        { value: "deconsolidation", label: "Deconsolidation" },
      ],
    },
    { name: "hubPort", label: "Hub Port", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "motherVessel", label: "Mother Vessel", type: "text" },
    { name: "feederVessel", label: "Feeder Vessel", type: "text" },
    { name: "containerCount", label: "Container Count", type: "number" },
    { name: "teuVolume", label: "TEU Volume", type: "text" },
    { name: "plannedTransferDate", label: "Planned Transfer Date", type: "datetime-local" },
    { name: "dwellTimeDays", label: "Dwell Time (Days)", type: "text" },
    { name: "priority", label: "Priority", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getCargoPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/transshipment-hub-management/cargo-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cargo Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Cargo Plan"
          apiPath={`/api/v1/transshipment-hub-management/cargo-plans/${id}`}
          fields={CARGO_PLAN_FIELDS}
          initialData={{
            planType: record.planType,
            hubPort: record.hubPort ?? "",
            originPort: record.originPort ?? "",
            destinationPort: record.destinationPort ?? "",
            motherVessel: record.motherVessel ?? "",
            feederVessel: record.feederVessel ?? "",
            containerCount: record.containerCount ?? "",
            teuVolume: record.teuVolume ?? "",
            plannedTransferDate: record.plannedTransferDate ? record.plannedTransferDate.toISOString().slice(0, 16) : "",
            dwellTimeDays: record.dwellTimeDays ?? "",
            priority: record.priority ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/transshipment-hub-management/cargo-plans/${id}`}
        />
      </div>
    </div>
  );
}
