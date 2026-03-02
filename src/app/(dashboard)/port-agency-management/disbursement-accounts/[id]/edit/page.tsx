import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDisbursementAccount } from "@/lib/port-agency-management/service";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const DISBURSEMENT_ACCOUNT_FIELDS: FieldConfig[] = [
  {
    name: "accountType",
    label: "Account Type",
    type: "select",
    required: true,
    options: [
      { value: "proforma", label: "Proforma" },
      { value: "final", label: "Final" },
      { value: "supplementary", label: "Supplementary" },
      { value: "credit_note", label: "Credit Note" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portCallRef", label: "Port Call Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "principalName", label: "Principal Name", type: "text" },
  { name: "principalRef", label: "Principal Ref", type: "text" },
  { name: "subtotal", label: "Subtotal", type: "number" },
  { name: "agencyFee", label: "Agency Fee", type: "number" },
  { name: "taxAmount", label: "Tax Amount", type: "number" },
  { name: "totalAmount", label: "Total Amount", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "advanceReceived", label: "Advance Received", type: "number" },
  { name: "balanceDue", label: "Balance Due", type: "number" },
  { name: "proformaRef", label: "Proforma Ref", type: "text" },
  { name: "proformaAmount", label: "Proforma Amount", type: "number" },
  {
    name: "varianceExplanation",
    label: "Variance Explanation",
    type: "textarea",
  },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDisbursementAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/disbursement-accounts");

  const { id } = await params;

  const account = await getDisbursementAccount(id, session.tenantId);
  if (!account) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/disbursement-accounts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Disbursement Account
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Disbursement Account"
          apiPath={`/api/v1/port-agency-management/disbursement-accounts/${id}`}
          fields={DISBURSEMENT_ACCOUNT_FIELDS}
          initialData={{
            accountType: account.accountType,
            vesselName: account.vesselName,
            imoNumber: account.imoNumber ?? "",
            portCallRef: account.portCallRef ?? "",
            portName: account.portName ?? "",
            voyageRef: account.voyageRef ?? "",
            principalName: account.principalName ?? "",
            principalRef: account.principalRef ?? "",
            subtotal: account.subtotal ?? "",
            agencyFee: account.agencyFee ?? "",
            taxAmount: account.taxAmount ?? "",
            totalAmount: account.totalAmount ?? "",
            currency: account.currency ?? "",
            advanceReceived: account.advanceReceived ?? "",
            balanceDue: account.balanceDue ?? "",
            proformaRef: account.proformaRef ?? "",
            proformaAmount: account.proformaAmount ?? "",
            varianceExplanation: account.varianceExplanation ?? "",
            dueDate: account.dueDate
              ? new Date(account.dueDate).toISOString()
              : "",
            notes: account.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/disbursement-accounts/${id}`}
        />
      </div>
    </div>
  );
}
