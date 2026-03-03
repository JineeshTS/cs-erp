import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgentCommission } from "@/lib/agent-network-management/service";
import {
  AnmForm,
  type FieldConfig,
} from "@/components/agent-network-management/anm-form";

const COMMISSION_FIELDS: FieldConfig[] = [
  {
    name: "commissionType",
    label: "Commission Type",
    type: "select",
    required: true,
    options: [
      { value: "freight_commission", label: "Freight Commission" },
      { value: "thc_commission", label: "THC Commission" },
      { value: "surcharge_commission", label: "Surcharge Commission" },
      { value: "bonus_commission", label: "Bonus Commission" },
      { value: "override_commission", label: "Override Commission" },
    ],
  },
  { name: "agentName", label: "Agent Name", type: "text" },
  { name: "agentCode", label: "Agent Code", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "freightAmount", label: "Freight Amount", type: "text" },
  { name: "commissionRate", label: "Commission Rate", type: "text" },
  { name: "commissionAmount", label: "Commission Amount", type: "text" },
  { name: "commissionCurrency", label: "Commission Currency", type: "text" },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  { name: "paymentDate", label: "Payment Date", type: "datetime-local" },
  { name: "paymentRef", label: "Payment Ref", type: "text" },
  { name: "invoiceNumber", label: "Invoice Number", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAgentCommissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getAgentCommission(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    commissionType: record.commissionType ?? "",
    agentName: record.agentName ?? "",
    agentCode: record.agentCode ?? "",
    bookingRef: record.bookingRef ?? "",
    freightAmount: record.freightAmount ?? "",
    commissionRate: record.commissionRate ?? "",
    commissionAmount: record.commissionAmount ?? "",
    commissionCurrency: record.commissionCurrency ?? "",
    periodFrom: record.periodFrom
      ? new Date(record.periodFrom).toISOString().slice(0, 16)
      : "",
    periodTo: record.periodTo
      ? new Date(record.periodTo).toISOString().slice(0, 16)
      : "",
    paymentDate: record.paymentDate
      ? new Date(record.paymentDate).toISOString().slice(0, 16)
      : "",
    paymentRef: record.paymentRef ?? "",
    invoiceNumber: record.invoiceNumber ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/agent-network-management/agent-commissions/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.commissionRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update agent commission details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <AnmForm
          entityType="Agent Commission"
          apiPath={`/api/v1/agent-network-management/agent-commissions/${id}`}
          returnPath="/agent-network-management/agent-commissions"
          fields={COMMISSION_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
