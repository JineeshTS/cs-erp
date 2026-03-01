import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFreightInvoice } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

export default async function FreightInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;

  const invoice = await getFreightInvoice(id, session.tenantId);
  if (!invoice) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/freight-invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {invoice.invoiceType} &middot; {invoice.customerName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/freight-invoices/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Invoice Number
            </dt>
            <dd className="mt-1 text-gray-900">{invoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Type</dt>
            <dd className="mt-1 text-gray-900">{invoice.invoiceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.voyageRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.bookingRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">B/L Number</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.blNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Name
            </dt>
            <dd className="mt-1 text-gray-900">{invoice.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.customerCode || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Billing Address
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {invoice.billingAddress || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{invoice.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.subtotal?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.taxAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Discount Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.discountAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {invoice.totalAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.paidAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Outstanding Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.outstandingAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Terms
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.paymentTerms || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issued At</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.issuedAt
                ? new Date(invoice.issuedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dispatched At
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.dispatchedAt
                ? new Date(invoice.dispatchedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dispatch Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {invoice.dispatchMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  invoice.status === "paid"
                    ? "success"
                    : invoice.status === "overdue" ||
                        invoice.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {invoice.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {invoice.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
