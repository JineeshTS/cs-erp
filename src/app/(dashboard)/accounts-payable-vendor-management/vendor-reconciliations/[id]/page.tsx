import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorReconciliation } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function VendorReconciliationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/accounts-payable-vendor-management");

  const { id } = await params;
  const record = await getVendorReconciliation(id, session.tenantId);

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
          href="/accounts-payable-vendor-management/vendor-reconciliations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Vendor Reconciliation Detail
          </h1>
          <p className="text-sm text-gray-500">
            {record.reconciliationRef} &mdash; {record.vendorName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/accounts-payable-vendor-management/vendor-reconciliations/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/accounts-payable-vendor-management/vendor-reconciliations/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Reconciliation Ref",
              value: record.reconciliationRef,
            },
            { label: "Vendor Name", value: record.vendorName },
            {
              label: "Reconciliation Date",
              value: record.reconciliationDate
                ? new Date(record.reconciliationDate).toLocaleString()
                : "--",
            },
            {
              label: "Period From",
              value: record.periodFrom
                ? new Date(record.periodFrom).toLocaleString()
                : "--",
            },
            {
              label: "Period To",
              value: record.periodTo
                ? new Date(record.periodTo).toLocaleString()
                : "--",
            },
            { label: "Currency", value: record.currency ?? "--" },
            {
              label: "Our Balance",
              value: Number(record.ourBalance).toLocaleString(),
            },
            {
              label: "Vendor Balance",
              value: Number(record.vendorBalance).toLocaleString(),
            },
            {
              label: "Difference Amount",
              value: Number(record.differenceAmount).toLocaleString(),
            },
            {
              label: "Reconciled Amount",
              value:
                record.reconciledAmount != null
                  ? Number(record.reconciledAmount).toLocaleString()
                  : "--",
            },
            {
              label: "Unreconciled Amount",
              value:
                record.unreconciledAmount != null
                  ? Number(record.unreconciledAmount).toLocaleString()
                  : "--",
            },
            {
              label: "Total Invoices",
              value:
                record.totalInvoices != null
                  ? record.totalInvoices.toString()
                  : "--",
            },
            {
              label: "Total Payments",
              value:
                record.totalPayments != null
                  ? record.totalPayments.toString()
                  : "--",
            },
            {
              label: "Matched Items",
              value:
                record.matchedItems != null
                  ? record.matchedItems.toString()
                  : "--",
            },
            {
              label: "Unmatched Items",
              value:
                record.unmatchedItems != null
                  ? record.unmatchedItems.toString()
                  : "--",
            },
            {
              label: "Performed By",
              value: record.performedByName ?? "--",
            },
            {
              label: "Reviewed By",
              value: record.reviewedByName ?? "--",
            },
            {
              label: "Reviewed At",
              value: record.reviewedAt
                ? new Date(record.reviewedAt).toLocaleString()
                : "--",
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
                        : field.value === "draft"
                          ? "secondary"
                          : field.value === "in_review"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {String(field.value).replace(/_/g, " ")}
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
