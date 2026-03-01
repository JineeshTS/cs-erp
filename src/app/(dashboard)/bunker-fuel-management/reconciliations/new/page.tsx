import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { BfmForm } from "@/components/bunker-fuel-management/bfm-form";
import type { FieldConfig } from "@/components/bunker-fuel-management/bfm-form";

const RECONCILIATION_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "vesselImo", label: "Vessel IMO", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  {
    name: "fuelType",
    label: "Fuel Type",
    type: "select",
    required: true,
    options: [
      { value: "VLSFO", label: "VLSFO" },
      { value: "HSFO", label: "HSFO" },
      { value: "LSMGO", label: "LSMGO" },
      { value: "MGO", label: "MGO" },
      { value: "MDO", label: "MDO" },
      { value: "LNG", label: "LNG" },
      { value: "ULSFO", label: "ULSFO" },
      { value: "HFO", label: "HFO" },
      { value: "BIOFUEL", label: "BIOFUEL" },
    ],
  },
  {
    name: "periodStart",
    label: "Period Start",
    type: "datetime-local",
    required: true,
  },
  {
    name: "periodEnd",
    label: "Period End",
    type: "datetime-local",
    required: true,
  },
  {
    name: "openingRob",
    label: "Opening ROB",
    type: "number",
    required: true,
  },
  {
    name: "closingRob",
    label: "Closing ROB",
    type: "number",
    required: true,
  },
  { name: "totalReceived", label: "Total Received", type: "number" },
  { name: "totalConsumed", label: "Total Consumed", type: "number" },
  { name: "totalTransferred", label: "Total Transferred", type: "number" },
  { name: "variance", label: "Variance", type: "number" },
  { name: "variancePercent", label: "Variance Percent", type: "number" },
  {
    name: "unit",
    label: "Unit",
    type: "select",
    options: [
      { value: "MT", label: "MT" },
      { value: "CBM", label: "CBM" },
      { value: "LTR", label: "LTR" },
      { value: "GAL", label: "GAL" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewReconciliationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/reconciliations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/reconciliations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Fuel Reconciliation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Fuel Reconciliation"
          apiPath="/api/v1/bunker-fuel-management/reconciliations"
          fields={RECONCILIATION_FIELDS}
          returnPath="/bunker-fuel-management/reconciliations"
        />
      </div>
    </div>
  );
}
