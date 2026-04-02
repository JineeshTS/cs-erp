import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewBankGuaranteePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/bank-guarantees");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/bank-guarantees"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Bank Guarantee
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Guarantee"
          apiPath="/api/v1/treasury-cash-management/bank-guarantees"
          fields={BANK_GUARANTEE_FIELDS}
          returnPath="/treasury-cash-management/bank-guarantees"
        />
      </div>
    </div>
  );
}
