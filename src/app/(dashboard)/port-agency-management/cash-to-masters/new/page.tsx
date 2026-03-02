import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const CASH_TO_MASTER_FIELDS: FieldConfig[] = [
  {
    name: "transactionType",
    label: "Transaction Type",
    type: "select",
    required: true,
    options: [
      { value: "cash_advance", label: "Cash Advance" },
      { value: "petty_cash", label: "Petty Cash" },
      { value: "reimbursement", label: "Reimbursement" },
      { value: "settlement", label: "Settlement" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portCallRef", label: "Port Call Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "masterName", label: "Master Name", type: "text" },
  {
    name: "requestedAmount",
    label: "Requested Amount",
    type: "number",
    required: true,
  },
  { name: "currency", label: "Currency", type: "text" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number" },
  { name: "localCurrency", label: "Local Currency", type: "text" },
  { name: "localAmount", label: "Local Amount", type: "number" },
  { name: "purpose", label: "Purpose", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCashToMasterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "port_agency:create"))
  )
    redirect("/port-agency-management/cash-to-masters");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/cash-to-masters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cash to Master
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Cash to Master"
          apiPath="/api/v1/port-agency-management/cash-to-masters"
          fields={CASH_TO_MASTER_FIELDS}
          returnPath="/port-agency-management/cash-to-masters"
        />
      </div>
    </div>
  );
}
