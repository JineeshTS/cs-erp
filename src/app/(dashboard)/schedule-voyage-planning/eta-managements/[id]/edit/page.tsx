import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getEtaManagement } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

const ETA_MANAGEMENT_FIELDS: FieldConfig[] = [
  {
    name: "etaType",
    label: "ETA Type",
    type: "select",
    required: true,
    options: [
      { value: "initial_estimate", label: "Initial Estimate" },
      { value: "revised_eta", label: "Revised ETA" },
      { value: "final_eta", label: "Final ETA" },
      { value: "customer_notification", label: "Customer Notification" },
      { value: "port_advisory", label: "Port Advisory" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "originalEta", label: "Original ETA", type: "datetime-local" },
  { name: "revisedEta", label: "Revised ETA", type: "datetime-local" },
  { name: "actualArrival", label: "Actual Arrival", type: "datetime-local" },
  { name: "delayHours", label: "Delay Hours", type: "text" },
  { name: "delayReason", label: "Delay Reason", type: "text" },
  { name: "notificationSent", label: "Notification Sent", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditEtaManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/eta-managements");

  const { id } = await params;

  const record = await getEtaManagement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/eta-managements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit ETA Management
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="ETA Management"
          apiPath={`/api/v1/schedule-voyage-planning/eta-managements/${id}`}
          fields={ETA_MANAGEMENT_FIELDS}
          initialData={{
            etaType: record.etaType,
            vesselName: record.vesselName ?? "",
            portCode: record.portCode ?? "",
            portName: record.portName ?? "",
            originalEta: record.originalEta ? record.originalEta.toISOString().slice(0, 16) : "",
            revisedEta: record.revisedEta ? record.revisedEta.toISOString().slice(0, 16) : "",
            actualArrival: record.actualArrival ? record.actualArrival.toISOString().slice(0, 16) : "",
            delayHours: record.delayHours ?? "",
            delayReason: record.delayReason ?? "",
            notificationSent: record.notificationSent ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/eta-managements/${id}`}
        />
      </div>
    </div>
  );
}
