import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PdaForm, type FieldConfig } from "@/components/port-disbursement-accounting/pda-form";

const PE_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "portCode", label: "Port Code", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  {
    name: "callPurpose",
    label: "Call Purpose",
    type: "select",
    required: true,
    options: [
      { value: "loading", label: "Loading" },
      { value: "discharge", label: "Discharge" },
      { value: "bunkering", label: "Bunkering" },
      { value: "drydock", label: "Drydock" },
      { value: "transshipment", label: "Transshipment" },
      { value: "crew_change", label: "Crew Change" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "agentName", label: "Agent Name", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "portDues", label: "Port Dues", type: "number" },
  { name: "pilotage", label: "Pilotage", type: "number" },
  { name: "towage", label: "Towage", type: "number" },
  { name: "berthHire", label: "Berth Hire", type: "number" },
  { name: "cargoHandling", label: "Cargo Handling", type: "number" },
  { name: "agencyFees", label: "Agency Fees", type: "number" },
  { name: "customs", label: "Customs", type: "number" },
  { name: "miscellaneous", label: "Miscellaneous", type: "number" },
  { name: "totalEstimate", label: "Total Estimate", type: "number", required: true },
  { name: "estimateDate", label: "Estimate Date", type: "datetime-local", required: true },
  { name: "validUntil", label: "Valid Until", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewProformaEstimatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:create")))
    redirect("/port-disbursement-accounting");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/proforma-estimates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Proforma Estimate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Proforma Estimate"
          apiPath="/api/v1/port-disbursement-accounting/proforma-estimates"
          fields={PE_FIELDS}
          returnPath="/port-disbursement-accounting/proforma-estimates"
        />
      </div>
    </div>
  );
}
