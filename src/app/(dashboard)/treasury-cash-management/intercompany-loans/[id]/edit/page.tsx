import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIntercompanyLoan } from "@/lib/treasury-cash-management/service";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditIntercompanyLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:edit")))
    redirect("/treasury-cash-management/intercompany-loans");

  const currencyOpts = await getCurrencyOptions();

  const INTERCOMPANY_LOAN_FIELDS: FieldConfig[] = [
    {
      name: "loanType",
      label: "Loan Type",
      type: "select",
      required: true,
      options: [
        { value: "term_loan", label: "Term Loan" },
        { value: "revolving", label: "Revolving" },
        { value: "demand", label: "Demand" },
        { value: "subordinated", label: "Subordinated" },
        { value: "bridge", label: "Bridge" },
      ],
    },
    { name: "lenderEntity", label: "Lender Entity", type: "text" },
    { name: "borrowerEntity", label: "Borrower Entity", type: "text" },
    { name: "principalAmount", label: "Principal Amount", type: "text" },
    {
      name: "outstandingBalance",
      label: "Outstanding Balance",
      type: "text",
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "interestRate", label: "Interest Rate", type: "text" },
    {
      name: "interestType",
      label: "Interest Type",
      type: "select",
      options: [
        { value: "fixed", label: "Fixed" },
        { value: "variable", label: "Variable" },
        { value: "libor_plus", label: "LIBOR Plus" },
        { value: "sofr_plus", label: "SOFR Plus" },
      ],
    },
    {
      name: "disbursementDate",
      label: "Disbursement Date",
      type: "datetime-local",
    },
    { name: "maturityDate", label: "Maturity Date", type: "datetime-local" },
    {
      name: "repaymentFrequency",
      label: "Repayment Frequency",
      type: "select",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "semi_annual", label: "Semi-Annual" },
        { value: "annual", label: "Annual" },
        { value: "bullet", label: "Bullet" },
      ],
    },
    {
      name: "nextPaymentDate",
      label: "Next Payment Date",
      type: "datetime-local",
    },
    {
      name: "totalInterestAccrued",
      label: "Total Interest Accrued",
      type: "text",
    },
    { name: "totalRepayments", label: "Total Repayments", type: "text" },
    {
      name: "transferPricingCompliance",
      label: "Transfer Pricing Compliance",
      type: "checkbox",
    },
    { name: "armLengthRate", label: "Arm's Length Rate", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getIntercompanyLoan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/treasury-cash-management/intercompany-loans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Intercompany Loan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Intercompany Loan"
          apiPath={`/api/v1/treasury-cash-management/intercompany-loans/${id}`}
          fields={INTERCOMPANY_LOAN_FIELDS}
          initialData={{
            loanType: record.loanType ?? "",
            lenderEntity: record.lenderEntity ?? "",
            borrowerEntity: record.borrowerEntity ?? "",
            principalAmount: record.principalAmount ?? "",
            outstandingBalance: record.outstandingBalance ?? "",
            currency: record.currency ?? "",
            interestRate: record.interestRate ?? "",
            interestType: record.interestType ?? "",
            disbursementDate: record.disbursementDate
              ? new Date(record.disbursementDate).toISOString()
              : "",
            maturityDate: record.maturityDate
              ? new Date(record.maturityDate).toISOString()
              : "",
            repaymentFrequency: record.repaymentFrequency ?? "",
            nextPaymentDate: record.nextPaymentDate
              ? new Date(record.nextPaymentDate).toISOString()
              : "",
            totalInterestAccrued: record.totalInterestAccrued ?? "",
            totalRepayments: record.totalRepayments ?? "",
            transferPricingCompliance: record.transferPricingCompliance ?? false,
            armLengthRate: record.armLengthRate ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/treasury-cash-management/intercompany-loans/${id}`}
        />
      </div>
    </div>
  );
}
