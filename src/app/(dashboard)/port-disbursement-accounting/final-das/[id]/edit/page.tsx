import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFinalDa } from "@/lib/port-disbursement-accounting/service";
import { PdaForm, type FieldConfig } from "@/components/port-disbursement-accounting/pda-form";

const FDA_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "portCode", label: "Port Code", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "proformaRef", label: "Proforma Ref", type: "text" },
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
  { name: "totalActual", label: "Total Actual", type: "number", required: true },
  { name: "invoiceRef", label: "Invoice Ref", type: "text" },
  { name: "invoiceDate", label: "Invoice Date", type: "datetime-local" },
  { name: "receivedDate", label: "Received Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditFinalDaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:edit")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;

  const record = await getFinalDa(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/final-das/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Final DA</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Final DA"
          apiPath={`/api/v1/port-disbursement-accounting/final-das/${id}`}
          fields={FDA_FIELDS}
          initialData={{
            vesselName: record.vesselName,
            portCode: record.portCode,
            portName: record.portName,
            proformaRef: record.proformaRef ?? "",
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
            totalActual: Number(record.totalActual),
            invoiceRef: record.invoiceRef ?? "",
            invoiceDate: record.invoiceDate
              ? new Date(record.invoiceDate).toISOString()
              : "",
            receivedDate: record.receivedDate
              ? new Date(record.receivedDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/port-disbursement-accounting/final-das/${id}`}
        />
      </div>
    </div>
  );
}
