import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const PORT_CALL_PLAN_FIELDS: FieldConfig[] = [
  {
    name: "planType",
    label: "Plan Type",
    type: "select",
    required: true,
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "unscheduled", label: "Unscheduled" },
      { value: "emergency", label: "Emergency" },
      { value: "bunker_only", label: "Bunker Only" },
      { value: "crew_change", label: "Crew Change" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "berthName", label: "Berth Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "agentName", label: "Agent Name", type: "text" },
  { name: "agentContactEmail", label: "Agent Contact Email", type: "text" },
  { name: "agentContactPhone", label: "Agent Contact Phone", type: "text" },
  { name: "eta", label: "ETA", type: "datetime-local" },
  { name: "etd", label: "ETD", type: "datetime-local" },
  { name: "pilotRequired", label: "Pilot Required", type: "checkbox" },
  { name: "tugRequired", label: "Tug Required", type: "checkbox" },
  { name: "tugsCount", label: "Tugs Count", type: "number" },
  {
    name: "specialInstructions",
    label: "Special Instructions",
    type: "textarea",
  },
  {
    name: "portChargesEstimate",
    label: "Port Charges Estimate",
    type: "number",
  },
  { name: "portChargesCurrency", label: "Port Charges Currency", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortCallPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "port_agency:create"))
  )
    redirect("/port-agency-management/port-call-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/port-call-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Call Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Port Call Plan"
          apiPath="/api/v1/port-agency-management/port-call-plans"
          fields={PORT_CALL_PLAN_FIELDS}
          returnPath="/port-agency-management/port-call-plans"
        />
      </div>
    </div>
  );
}
