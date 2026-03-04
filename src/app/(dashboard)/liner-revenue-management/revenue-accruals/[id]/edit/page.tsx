import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueAccrual } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

const REVENUE_ACCRUAL_FIELDS: FieldConfig[] = [
  {
    name: "accrualType",
    label: "Accrual Type",
    type: "select",
    required: true,
    options: [
      { value: "freight_accrual", label: "Freight Accrual" },
      { value: "surcharge_accrual", label: "Surcharge Accrual" },
      { value: "demurrage_accrual", label: "Demurrage Accrual" },
      { value: "detention_accrual", label: "Detention Accrual" },
      { value: "ancillary_accrual", label: "Ancillary Accrual" },
    ],
  },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "accrualAmount", label: "Accrual Amount", type: "text" },
  { name: "billedAmount", label: "Billed Amount", type: "text" },
  { name: "varianceAmount", label: "Variance Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "accrualPeriod", label: "Accrual Period", type: "text" },
  { name: "recognitionDate", label: "Recognition Date", type: "datetime-local" },
  { name: "reversalDate", label: "Reversal Date", type: "datetime-local" },
  { name: "glAccountCode", label: "GL Account Code", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRevenueAccrualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/revenue-accruals");

  const { id } = await params;

  const record = await getRevenueAccrual(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/revenue-accruals/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Revenue Accrual
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Revenue Accrual"
          apiPath={`/api/v1/liner-revenue-management/revenue-accruals/${id}`}
          fields={REVENUE_ACCRUAL_FIELDS}
          initialData={{
            accrualType: record.accrualType,
            voyageRef: record.voyageRef ?? "",
            customerName: record.customerName ?? "",
            accrualAmount: record.accrualAmount ?? "",
            billedAmount: record.billedAmount ?? "",
            varianceAmount: record.varianceAmount ?? "",
            currency: record.currency ?? "",
            accrualPeriod: record.accrualPeriod ?? "",
            recognitionDate: record.recognitionDate ? record.recognitionDate.toISOString().slice(0, 16) : "",
            reversalDate: record.reversalDate ? record.reversalDate.toISOString().slice(0, 16) : "",
            glAccountCode: record.glAccountCode ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/revenue-accruals/${id}`}
        />
      </div>
    </div>
  );
}
