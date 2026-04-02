import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMissedConnection } from "@/lib/transshipment-hub-management/service";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditMissedConnectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:edit")))
    redirect("/transshipment-hub-management/missed-connections");

  const currencyOpts = await getCurrencyOptions();

  const MISSED_CONNECTION_FIELDS: FieldConfig[] = [
    {
      name: "connectionType",
      label: "Connection Type",
      type: "select",
      required: true,
      options: [
        { value: "vessel_delay", label: "Vessel Delay" },
        { value: "port_congestion", label: "Port Congestion" },
        { value: "equipment_failure", label: "Equipment Failure" },
        { value: "weather_disruption", label: "Weather Disruption" },
        { value: "operational_error", label: "Operational Error" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "hubPort", label: "Hub Port", type: "text" },
    { name: "originalVessel", label: "Original Vessel", type: "text" },
    { name: "recoveryVessel", label: "Recovery Vessel", type: "text" },
    { name: "missedDate", label: "Missed Date", type: "datetime-local" },
    { name: "recoveryDate", label: "Recovery Date", type: "datetime-local" },
    { name: "delayDays", label: "Delay Days", type: "text" },
    { name: "additionalCost", label: "Additional Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "recovered", label: "Recovered", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getMissedConnection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/transshipment-hub-management/missed-connections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Missed Connection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Missed Connection"
          apiPath={`/api/v1/transshipment-hub-management/missed-connections/${id}`}
          fields={MISSED_CONNECTION_FIELDS}
          initialData={{
            connectionType: record.connectionType,
            containerNumber: record.containerNumber ?? "",
            hubPort: record.hubPort ?? "",
            originalVessel: record.originalVessel ?? "",
            recoveryVessel: record.recoveryVessel ?? "",
            missedDate: record.missedDate ? record.missedDate.toISOString().slice(0, 16) : "",
            recoveryDate: record.recoveryDate ? record.recoveryDate.toISOString().slice(0, 16) : "",
            delayDays: record.delayDays ?? "",
            additionalCost: record.additionalCost ?? "",
            currency: record.currency ?? "",
            recovered: record.recovered ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/transshipment-hub-management/missed-connections/${id}`}
        />
      </div>
    </div>
  );
}
