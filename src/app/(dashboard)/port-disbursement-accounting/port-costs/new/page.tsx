import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PdaForm,
  type FieldConfig,
} from "@/components/port-disbursement-accounting/pda-form";

const PORT_COST_FIELDS: FieldConfig[] = [
  { name: "portCode", label: "Port Code", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  {
    name: "costCategory",
    label: "Cost Category",
    type: "select",
    required: true,
    options: [
      { value: "port_dues", label: "Port Dues" },
      { value: "pilotage", label: "Pilotage" },
      { value: "towage", label: "Towage" },
      { value: "berth_hire", label: "Berth Hire" },
      { value: "cargo_handling", label: "Cargo Handling" },
      { value: "agency_fees", label: "Agency Fees" },
      { value: "customs", label: "Customs" },
      { value: "quarantine", label: "Quarantine" },
      { value: "anchorage", label: "Anchorage" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "costType",
    label: "Cost Type",
    type: "select",
    required: true,
    options: [
      { value: "fixed", label: "Fixed" },
      { value: "variable", label: "Variable" },
      { value: "tiered", label: "Tiered" },
      { value: "percentage", label: "Percentage" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "unitRate", label: "Unit Rate", type: "number", required: true },
  { name: "unitOfMeasure", label: "Unit of Measure", type: "text" },
  { name: "minimumCharge", label: "Minimum Charge", type: "number" },
  { name: "maximumCharge", label: "Maximum Charge", type: "number" },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "datetime-local",
    required: true,
  },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "vesselSizeFrom", label: "Vessel Size From", type: "number" },
  { name: "vesselSizeTo", label: "Vessel Size To", type: "number" },
  {
    name: "cargoTypeApplicable",
    label: "Cargo Type Applicable",
    type: "text",
  },
  { name: "sourceDocument", label: "Source Document", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortCostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "disbursement:create"))
  )
    redirect("/port-disbursement-accounting/port-costs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/port-costs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Port Cost</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Port Cost"
          apiPath="/api/v1/port-disbursement-accounting/port-costs"
          fields={PORT_COST_FIELDS}
          returnPath="/port-disbursement-accounting/port-costs"
        />
      </div>
    </div>
  );
}
