import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProcurementContract } from "@/lib/procurement-supply-chain/service";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditProcurementContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:edit")))
    redirect("/procurement-supply-chain/procurement-contracts");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "autoRenewal", label: "Auto Renewal", type: "checkbox" },
    { name: "renewalNoticeDays", label: "Renewal Notice Days", type: "number" },
    { name: "penaltyClause", label: "Penalty Clause", type: "textarea" },
    { name: "signedBy", label: "Signed By", type: "text" },
    { name: "signatureDate", label: "Signature Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getProcurementContract(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/procurement-supply-chain/procurement-contracts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Procurement Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Procurement Contract"
          apiPath={`/api/v1/procurement-supply-chain/procurement-contracts/${id}`}
          fields={CONTRACT_FIELDS}
          initialData={{
            contractType: record.contractType,
            title: record.title,
            vendorName: record.vendorName ?? "",
            vendorId: record.vendorId ?? "",
            startDate: record.startDate
              ? new Date(record.startDate).toISOString()
              : "",
            endDate: record.endDate
              ? new Date(record.endDate).toISOString()
              : "",
            contractValue: record.contractValue ?? "",
            currency: record.currency ?? "",
            paymentTerms: record.paymentTerms ?? "",
            autoRenewal: record.autoRenewal ?? false,
            renewalNoticeDays: record.renewalNoticeDays ?? "",
            penaltyClause: record.penaltyClause ?? "",
            signedBy: record.signedBy ?? "",
            signatureDate: record.signatureDate
              ? new Date(record.signatureDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/procurement-supply-chain/procurement-contracts/${id}`}
        />
      </div>
    </div>
  );
}
