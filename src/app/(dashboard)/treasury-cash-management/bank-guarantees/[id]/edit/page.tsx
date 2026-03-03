import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankGuarantee } from "@/lib/treasury-cash-management/service";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";

const BANK_GUARANTEE_FIELDS: FieldConfig[] = [
  {
    name: "bgType",
    label: "BG Type",
    type: "select",
    required: true,
    options: [
      { value: "performance", label: "Performance" },
      { value: "advance_payment", label: "Advance Payment" },
      { value: "bid_bond", label: "Bid Bond" },
      { value: "financial", label: "Financial" },
      { value: "customs", label: "Customs" },
      { value: "retention", label: "Retention" },
    ],
  },
  { name: "issuingBank", label: "Issuing Bank", type: "text" },
  { name: "applicant", label: "Applicant", type: "text" },
  { name: "beneficiary", label: "Beneficiary", type: "text" },
  { name: "guaranteeAmount", label: "Guarantee Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "claimDeadline", label: "Claim Deadline", type: "datetime-local" },
  { name: "marginPercentage", label: "Margin Percentage", type: "text" },
  { name: "marginAmount", label: "Margin Amount", type: "text" },
  { name: "commissionRate", label: "Commission Rate", type: "text" },
  { name: "commissionAmount", label: "Commission Amount", type: "text" },
  {
    name: "linkedContractRef",
    label: "Linked Contract Ref",
    type: "text",
  },
  { name: "purpose", label: "Purpose", type: "textarea" },
  {
    name: "termsAndConditions",
    label: "Terms and Conditions",
    type: "textarea",
  },
  { name: "autoRenewal", label: "Auto Renewal", type: "checkbox" },
  { name: "renewalCount", label: "Renewal Count", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditBankGuaranteePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:edit")))
    redirect("/treasury-cash-management/bank-guarantees");

  const { id } = await params;
  const record = await getBankGuarantee(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/treasury-cash-management/bank-guarantees/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Bank Guarantee
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Guarantee"
          apiPath={`/api/v1/treasury-cash-management/bank-guarantees/${id}`}
          fields={BANK_GUARANTEE_FIELDS}
          initialData={{
            bgType: record.bgType ?? "",
            issuingBank: record.issuingBank ?? "",
            applicant: record.applicant ?? "",
            beneficiary: record.beneficiary ?? "",
            guaranteeAmount: record.guaranteeAmount ?? "",
            currency: record.currency ?? "",
            issueDate: record.issueDate
              ? new Date(record.issueDate).toISOString()
              : "",
            expiryDate: record.expiryDate
              ? new Date(record.expiryDate).toISOString()
              : "",
            claimDeadline: record.claimDeadline
              ? new Date(record.claimDeadline).toISOString()
              : "",
            marginPercentage: record.marginPercentage ?? "",
            marginAmount: record.marginAmount ?? "",
            commissionRate: record.commissionRate ?? "",
            commissionAmount: record.commissionAmount ?? "",
            linkedContractRef: record.linkedContractRef ?? "",
            purpose: record.purpose ?? "",
            termsAndConditions: record.termsAndConditions ?? "",
            autoRenewal: record.autoRenewal ?? false,
            renewalCount: record.renewalCount ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/treasury-cash-management/bank-guarantees/${id}`}
        />
      </div>
    </div>
  );
}
