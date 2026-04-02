import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewRevenueAccrualPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/revenue-accruals");

  const currencyOpts = await getCurrencyOptions();

  const ACCRUAL_FIELDS: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "accrualType",
      label: "Accrual Type",
      type: "select",
      required: true,
      options: [
        { value: "freight_accrual", label: "Freight Accrual" },
        { value: "freight_deferral", label: "Freight Deferral" },
        { value: "demurrage_accrual", label: "Demurrage Accrual" },
        { value: "surcharge_accrual", label: "Surcharge Accrual" },
        { value: "period_end_accrual", label: "Period End Accrual" },
        { value: "reversal", label: "Reversal" },
      ],
    },
    {
      name: "accountingPeriod",
      label: "Accounting Period",
      type: "text",
      required: true,
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "accrualAmount",
      label: "Accrual Amount",
      type: "number",
      required: true,
    },
    { name: "deferralAmount", label: "Deferral Amount", type: "number" },
    { name: "recognizedAmount", label: "Recognized Amount", type: "number" },
    {
      name: "remainingAmount",
      label: "Remaining Amount",
      type: "number",
      required: true,
    },
    { name: "journalEntryRef", label: "Journal Entry Ref", type: "text" },
    { name: "glAccountCode", label: "GL Account Code", type: "text" },
    { name: "reversalDate", label: "Reversal Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/freight-invoice-revenue-management/revenue-accruals"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Revenue Accrual
          </h1>
          <p className="text-sm text-gray-500">
            Create a new revenue accrual entry
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Revenue Accrual"
          apiPath="/api/v1/freight-invoice-revenue-management/revenue-accruals"
          fields={ACCRUAL_FIELDS}
          returnPath="/freight-invoice-revenue-management/revenue-accruals"
        />
      </div>
    </div>
  );
}
