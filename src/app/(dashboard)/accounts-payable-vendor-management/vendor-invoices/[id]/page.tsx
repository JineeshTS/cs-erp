import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorInvoice } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function VendorInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/");

  const { id } = await params;
  const record = await getVendorInvoice(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "payable:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/vendor-invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.invoiceNumber}</h1>
          <p className="text-sm text-gray-500">Vendor Invoice &middot; {record.vendorName}</p>
        </div>
        {canEdit && (
          <Link
            href={`/accounts-payable-vendor-management/vendor-invoices/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-gray-900">{record.invoiceNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Invoice Ref</dt>
            <dd className="mt-1 text-gray-900">{record.vendorInvoiceRef ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Code</dt>
            <dd className="mt-1 text-gray-900">{record.vendorCode ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PO Number</dt>
            <dd className="mt-1 text-gray-900">{record.poNumber ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
            <dd className="mt-1 text-gray-900">{record.invoiceDate ? new Date(record.invoiceDate).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-gray-900">{record.dueDate ? new Date(record.dueDate).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-gray-900">{record.subtotal?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">{record.taxAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">{record.totalAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
            <dd className="mt-1 text-gray-900">{record.paidAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Outstanding Amount</dt>
            <dd className="mt-1 text-gray-900">{record.outstandingAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exchange Rate</dt>
            <dd className="mt-1 text-gray-900">{record.exchangeRate?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Base Currency Amount</dt>
            <dd className="mt-1 text-gray-900">{record.baseCurrencyAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Match Status</dt>
            <dd className="mt-1">
              <Badge variant={record.matchStatus === "matched" ? "success" : record.matchStatus === "partial" ? "warning" : "secondary"}>{record.matchStatus ?? "--"}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Matched At</dt>
            <dd className="mt-1 text-gray-900">{record.matchedAt ? new Date(record.matchedAt).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">{record.approvedByName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">{record.approvedAt ? new Date(record.approvedAt).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={record.status === "approved" ? "success" : record.status === "pending" ? "warning" : record.status === "draft" ? "secondary" : "destructive"}>{record.status}</Badge>
            </dd>
          </div>
        </dl>
      </div>

      {record.notes && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-900">{record.notes}</p>
        </div>
      )}
    </div>
  );
}
