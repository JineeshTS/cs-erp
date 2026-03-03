import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const CONTRACT_FIELDS: FieldConfig[] = [
  {
    name: "contractType",
    label: "Contract Type",
    type: "select",
    required: true,
    options: [
      { value: "fixed_price", label: "Fixed Price" },
      { value: "cost_plus", label: "Cost Plus" },
      { value: "framework", label: "Framework" },
      { value: "blanket", label: "Blanket" },
      { value: "service_level", label: "Service Level" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "vendorName", label: "Vendor Name", type: "text" },
  { name: "vendorId", label: "Vendor ID", type: "text" },
  { name: "startDate", label: "Start Date", type: "datetime-local" },
  { name: "endDate", label: "End Date", type: "datetime-local" },
  { name: "contractValue", label: "Contract Value", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "paymentTerms", label: "Payment Terms", type: "text" },
  { name: "autoRenewal", label: "Auto Renewal", type: "checkbox" },
  { name: "renewalNoticeDays", label: "Renewal Notice Days", type: "number" },
  { name: "penaltyClause", label: "Penalty Clause", type: "textarea" },
  { name: "signedBy", label: "Signed By", type: "text" },
  { name: "signatureDate", label: "Signature Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewProcurementContractPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "procurement:create"))
  )
    redirect("/procurement-supply-chain/procurement-contracts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/procurement-contracts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Procurement Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Procurement Contract"
          apiPath="/api/v1/procurement-supply-chain/procurement-contracts"
          fields={CONTRACT_FIELDS}
          returnPath="/procurement-supply-chain/procurement-contracts"
        />
      </div>
    </div>
  );
}
