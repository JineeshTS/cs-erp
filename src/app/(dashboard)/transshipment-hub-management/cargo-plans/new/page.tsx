import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";

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
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "motherVessel", label: "Mother Vessel", type: "text" },
  { name: "feederVessel", label: "Feeder Vessel", type: "text" },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "teuVolume", label: "TEU Volume", type: "text" },
  { name: "plannedTransferDate", label: "Planned Transfer Date", type: "datetime-local" },
  { name: "dwellTimeDays", label: "Dwell Time (Days)", type: "text" },
  { name: "priority", label: "Priority", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCargoPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/cargo-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/cargo-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cargo Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Cargo Plan"
          apiPath="/api/v1/transshipment-hub-management/cargo-plans"
          fields={CARGO_PLAN_FIELDS}
          returnPath="/transshipment-hub-management/cargo-plans"
        />
      </div>
    </div>
  );
}
