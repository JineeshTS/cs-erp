import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPortDisbursement } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function EditPortDisbursementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");

  const { id } = await params;
  const disbursement = await getPortDisbursement(id, session.tenantId);
  if (!disbursement) notFound();

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "text", required: true },
    { name: "port", label: "Port", type: "text", required: true },
    { name: "agentName", label: "Agent Name", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "disbursementType",
      label: "Disbursement Type",
      type: "select",
      required: true,
      options: [
        { value: "pda", label: "PDA" },
        { value: "fda", label: "FDA" },
        { value: "supplementary", label: "Supplementary" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    { name: "pdaAmount", label: "PDA Amount", type: "number" },
    { name: "fdaAmount", label: "FDA Amount", type: "number" },
    { name: "portDues", label: "Port Dues", type: "number" },
    { name: "pilotage", label: "Pilotage", type: "number" },
    { name: "towage", label: "Towage", type: "number" },
    { name: "berth", label: "Berth", type: "number" },
    { name: "cargoHandling", label: "Cargo Handling", type: "number" },
    { name: "agencyFee", label: "Agency Fee", type: "number" },
    { name: "otherCharges", label: "Other Charges", type: "number" },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: "number",
      required: true,
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    vesselName: disbursement.vesselName,
    port: disbursement.port,
    agentName: disbursement.agentName,
    voyageRef: disbursement.voyageRef,
    disbursementType: disbursement.disbursementType,
    currency: disbursement.currency,
    pdaAmount: disbursement.pdaAmount,
    fdaAmount: disbursement.fdaAmount,
    portDues: disbursement.portDues,
    pilotage: disbursement.pilotage,
    towage: disbursement.towage,
    berth: disbursement.berth,
    cargoHandling: disbursement.cargoHandling,
    agencyFee: disbursement.agencyFee,
    otherCharges: disbursement.otherCharges,
    totalAmount: disbursement.totalAmount,
    notes: disbursement.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/port-disbursements/${disbursement.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {disbursement.disbursementRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update port disbursement details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Port Disbursement"
          apiPath={`/api/v1/costing-financial-management/port-disbursements/${disbursement.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/port-disbursements"
        />
      </div>
    </div>
  );
}
