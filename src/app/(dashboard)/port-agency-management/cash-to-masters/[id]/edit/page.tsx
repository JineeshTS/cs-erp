import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashToMaster } from "@/lib/port-agency-management/service";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";
import { getPortOptions, getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditCashToMasterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/cash-to-masters");

  const [portOpts, vesselOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "portCallRef", label: "Port Call Ref", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "masterName", label: "Master Name", type: "text" },
    {
      name: "requestedAmount",
      label: "Requested Amount",
      type: "number",
      required: true,
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "exchangeRate", label: "Exchange Rate", type: "number" },
    { name: "localCurrency", label: "Local Currency", type: "text" },
    { name: "localAmount", label: "Local Amount", type: "number" },
    { name: "purpose", label: "Purpose", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const txn = await getCashToMaster(id, session.tenantId);
  if (!txn) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/cash-to-masters/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cash to Master
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Cash to Master"
          apiPath={`/api/v1/port-agency-management/cash-to-masters/${id}`}
          fields={CASH_TO_MASTER_FIELDS}
          initialData={{
            transactionType: txn.transactionType,
            vesselName: txn.vesselName,
            imoNumber: txn.imoNumber ?? "",
            portCallRef: txn.portCallRef ?? "",
            portName: txn.portName ?? "",
            masterName: txn.masterName ?? "",
            requestedAmount: txn.requestedAmount ?? "",
            currency: txn.currency ?? "",
            exchangeRate: txn.exchangeRate ?? "",
            localCurrency: txn.localCurrency ?? "",
            localAmount: txn.localAmount ?? "",
            purpose: txn.purpose ?? "",
            notes: txn.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/cash-to-masters/${id}`}
        />
      </div>
    </div>
  );
}
