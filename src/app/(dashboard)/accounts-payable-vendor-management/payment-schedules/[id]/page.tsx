import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPaymentSchedule } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function PaymentScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/accounts-payable-vendor-management");

  const { id } = await params;
  const record = await getPaymentSchedule(id, session.tenantId);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "payable:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "payable:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/payment-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Schedule Detail
          </h1>
          <p className="text-sm text-gray-500">
            {record.scheduleRef} &mdash; {record.vendorName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/accounts-payable-vendor-management/payment-schedules/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/accounts-payable-vendor-management/payment-schedules/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Schedule Ref", value: record.scheduleRef },
            { label: "Vendor Name", value: record.vendorName },
            { label: "Invoice Number", value: record.invoiceNumber ?? "--" },
            { label: "Currency", value: record.currency ?? "--" },
            {
              label: "Payment Amount",
              value: Number(record.paymentAmount).toLocaleString(),
            },
            {
              label: "Scheduled Date",
              value: record.scheduledDate
                ? new Date(record.scheduledDate).toLocaleString()
                : "--",
            },
            { label: "Payment Method", value: record.paymentMethod },
            { label: "Bank Account", value: record.bankAccount ?? "--" },
            {
              label: "Beneficiary Account",
              value: record.beneficiaryAccount ?? "--",
            },
            {
              label: "Payment Reference",
              value: record.paymentReference ?? "--",
            },
            {
              label: "Exchange Rate",
              value:
                record.exchangeRate != null
                  ? Number(record.exchangeRate).toLocaleString()
                  : "--",
            },
            {
              label: "Base Currency Amount",
              value:
                record.baseCurrencyAmount != null
                  ? Number(record.baseCurrencyAmount).toLocaleString()
                  : "--",
            },
            { label: "Batch ID", value: record.batchId ?? "--" },
            { label: "Priority Level", value: record.priorityLevel ?? "--" },
            {
              label: "Approved By",
              value: record.approvedByName ?? "--",
            },
            {
              label: "Approved At",
              value: record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "--",
            },
            {
              label: "Executed At",
              value: record.executedAt
                ? new Date(record.executedAt).toLocaleString()
                : "--",
            },
            {
              label: "Confirmation Ref",
              value: record.confirmationRef ?? "--",
            },
            { label: "Status", value: record.status },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {field.label === "Status" ? (
                  <Badge
                    variant={
                      field.value === "completed"
                        ? "success"
                        : field.value === "scheduled"
                          ? "secondary"
                          : field.value === "failed"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {field.value}
                  </Badge>
                ) : (
                  field.value
                )}
              </p>
            </div>
          ))}
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
