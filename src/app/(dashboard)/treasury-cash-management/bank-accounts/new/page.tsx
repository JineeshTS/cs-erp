import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";

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
    type: "text",
    placeholder: "QAR",
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

export default async function NewBankAccountPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/bank-accounts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/bank-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Bank Account
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Account"
          apiPath="/api/v1/treasury-cash-management/bank-accounts"
          fields={BANK_ACCOUNT_FIELDS}
          returnPath="/treasury-cash-management/bank-accounts"
        />
      </div>
    </div>
  );
}
