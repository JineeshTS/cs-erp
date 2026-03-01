import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function NewPortDisbursementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/port-disbursements"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Port Disbursement
          </h1>
          <p className="text-sm text-gray-500">
            Create a new port disbursement account
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Port Disbursement"
          apiPath="/api/v1/costing-financial-management/port-disbursements"
          fields={fields}
          returnPath="/costing-financial-management/port-disbursements"
        />
      </div>
    </div>
  );
}
