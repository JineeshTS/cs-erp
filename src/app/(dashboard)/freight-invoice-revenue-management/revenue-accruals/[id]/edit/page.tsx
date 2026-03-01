import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getRevenueAccrual } from "@/lib/freight-invoice-revenue-management/service";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

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
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
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

export default async function EditRevenueAccrualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/revenue-accruals");

  const { id } = await params;
  const record = await getRevenueAccrual(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    voyageRef: record.voyageRef,
    accrualType: record.accrualType,
    accountingPeriod: record.accountingPeriod,
    currency: record.currency,
    accrualAmount: record.accrualAmount,
    deferralAmount: record.deferralAmount,
    recognizedAmount: record.recognizedAmount,
    remainingAmount: record.remainingAmount,
    journalEntryRef: record.journalEntryRef,
    glAccountCode: record.glAccountCode,
    reversalDate: record.reversalDate
      ? new Date(record.reversalDate).toISOString()
      : "",
    notes: record.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/freight-invoice-revenue-management/revenue-accruals/${record.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.accrualRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update revenue accrual details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Revenue Accrual"
          apiPath={`/api/v1/freight-invoice-revenue-management/revenue-accruals/${record.id}`}
          fields={ACCRUAL_FIELDS}
          initialData={initialData}
          isEdit
          returnPath="/freight-invoice-revenue-management/revenue-accruals"
        />
      </div>
    </div>
  );
}
