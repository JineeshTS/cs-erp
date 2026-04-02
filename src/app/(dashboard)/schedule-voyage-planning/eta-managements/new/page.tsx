import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewEtaManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/eta-managements");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "originalEta", label: "Original ETA", type: "datetime-local" },
    { name: "revisedEta", label: "Revised ETA", type: "datetime-local" },
    { name: "actualArrival", label: "Actual Arrival", type: "datetime-local" },
    { name: "delayHours", label: "Delay Hours", type: "text" },
    { name: "delayReason", label: "Delay Reason", type: "text" },
    { name: "notificationSent", label: "Notification Sent", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/eta-managements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New ETA Management
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="ETA Management"
          apiPath="/api/v1/schedule-voyage-planning/eta-managements"
          fields={ETA_MANAGEMENT_FIELDS}
          returnPath="/schedule-voyage-planning/eta-managements"
        />
      </div>
    </div>
  );
}
