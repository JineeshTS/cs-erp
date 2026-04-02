import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProformaEstimate } from "@/lib/port-disbursement-accounting/service";
import { PdaForm, type FieldConfig } from "@/components/port-disbursement-accounting/pda-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditProformaEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:edit")))
    redirect("/port-disbursement-accounting");

  const [portOpts, vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const PE_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts, required: true },
    { name: "portName", label: "Port Name", type: "select", options: portOpts, required: true },
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
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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

  const { id } = await params;

  const record = await getProformaEstimate(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/proforma-estimates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Proforma Estimate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Proforma Estimate"
          apiPath={`/api/v1/port-disbursement-accounting/proforma-estimates/${id}`}
          fields={PE_FIELDS}
          initialData={{
            vesselName: record.vesselName,
            portCode: record.portCode,
            portName: record.portName,
            callPurpose: record.callPurpose,
            voyageRef: record.voyageRef ?? "",
            agentName: record.agentName ?? "",
            currency: record.currency,
            portDues: record.portDues ? Number(record.portDues) : "",
            pilotage: record.pilotage ? Number(record.pilotage) : "",
            towage: record.towage ? Number(record.towage) : "",
            berthHire: record.berthHire ? Number(record.berthHire) : "",
            cargoHandling: record.cargoHandling ? Number(record.cargoHandling) : "",
            agencyFees: record.agencyFees ? Number(record.agencyFees) : "",
            customs: record.customs ? Number(record.customs) : "",
            miscellaneous: record.miscellaneous ? Number(record.miscellaneous) : "",
            totalEstimate: Number(record.totalEstimate),
            estimateDate: record.estimateDate
              ? new Date(record.estimateDate).toISOString()
              : "",
            validUntil: record.validUntil
              ? new Date(record.validUntil).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/port-disbursement-accounting/proforma-estimates/${id}`}
        />
      </div>
    </div>
  );
}
