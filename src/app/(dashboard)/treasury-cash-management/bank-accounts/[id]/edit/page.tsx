import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankAccount } from "@/lib/treasury-cash-management/service";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditBankAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:edit")))
    redirect("/treasury-cash-management/bank-accounts");

  const currencyOpts = await getCurrencyOptions();

  const BANK_ACCOUNT_FIELDS: FieldConfig[] = [
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      required: true,
      options: [
        { value: "current", label: "Current" },
        { value: "savings", label: "Savings" },
        { value: "fixed_deposit", label: "Fixed Deposit" },
        { value: "nostro", label: "Nostro" },
        { value: "vostro", label: "Vostro" },
        { value: "escrow", label: "Escrow" },
      ],
    },
    { name: "bankName", label: "Bank Name", type: "text", required: true },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "iban", label: "IBAN", type: "text" },
    { name: "swiftCode", label: "SWIFT Code", type: "text" },
    { name: "branchName", label: "Branch Name", type: "text" },
    { name: "branchCode", label: "Branch Code", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "currentBalance", label: "Current Balance", type: "text" },
    { name: "availableBalance", label: "Available Balance", type: "text" },
    { name: "overdraftLimit", label: "Overdraft Limit", type: "text" },
    { name: "interestRate", label: "Interest Rate", type: "text" },
    { name: "accountHolder", label: "Account Holder", type: "text" },
    { name: "entityId", label: "Entity ID", type: "text" },
    { name: "glAccountCode", label: "GL Account Code", type: "text" },
    { name: "openingDate", label: "Opening Date", type: "datetime-local" },
    { name: "closingDate", label: "Closing Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getBankAccount(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/treasury-cash-management/bank-accounts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Bank Account
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Account"
          apiPath={`/api/v1/treasury-cash-management/bank-accounts/${id}`}
          fields={BANK_ACCOUNT_FIELDS}
          initialData={{
            accountType: record.accountType,
            bankName: record.bankName,
            accountNumber: record.accountNumber ?? "",
            iban: record.iban ?? "",
            swiftCode: record.swiftCode ?? "",
            branchName: record.branchName ?? "",
            branchCode: record.branchCode ?? "",
            currency: record.currency ?? "",
            currentBalance: record.currentBalance ?? "",
            availableBalance: record.availableBalance ?? "",
            overdraftLimit: record.overdraftLimit ?? "",
            interestRate: record.interestRate ?? "",
            accountHolder: record.accountHolder ?? "",
            entityId: record.entityId ?? "",
            glAccountCode: record.glAccountCode ?? "",
            openingDate: record.openingDate
              ? new Date(record.openingDate).toISOString()
              : "",
            closingDate: record.closingDate
              ? new Date(record.closingDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/treasury-cash-management/bank-accounts/${id}`}
        />
      </div>
    </div>
  );
}
