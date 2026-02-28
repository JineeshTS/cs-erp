import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const CONTRACT_FIELDS: FieldConfig[] = [
  { name: "contractNumber", label: "Contract Number", type: "text", required: true },
  { name: "contractName", label: "Contract Name", type: "text", required: true },
  { name: "customerId", label: "Customer ID", type: "text", required: true, placeholder: "UUID of the customer" },
  { name: "quotationId", label: "Quotation ID", type: "text" },
  { name: "contractType", label: "Contract Type", type: "select", options: [
    { value: "standard", label: "Standard" },
    { value: "volume_commitment", label: "Volume Commitment" },
    { value: "coa", label: "COA" },
    { value: "spot", label: "Spot" },
    { value: "framework", label: "Framework" },
  ]},
  { name: "startDate", label: "Start Date", type: "datetime-local", required: true },
  { name: "endDate", label: "End Date", type: "datetime-local", required: true },
  { name: "autoRenew", label: "Auto Renew", type: "checkbox" },
  { name: "renewalTermDays", label: "Renewal Term (Days)", type: "number" },
  { name: "minimumCommitmentTeu", label: "Min Commitment TEU", type: "number" },
  { name: "maximumCommitmentTeu", label: "Max Commitment TEU", type: "number" },
  { name: "penaltyRate", label: "Penalty Rate", type: "number" },
  { name: "totalValue", label: "Total Value", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "paymentTermsDays", label: "Payment Terms (Days)", type: "number" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "salesRepId", label: "Sales Rep ID", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "terminated", label: "Terminated" },
    { value: "suspended", label: "Suspended" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewContractPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/contracts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Contract"
          apiPath="/api/v1/sales-crm/contracts"
          fields={CONTRACT_FIELDS}
          returnPath="/sales-crm/contracts"
        />
      </div>
    </div>
  );
}
