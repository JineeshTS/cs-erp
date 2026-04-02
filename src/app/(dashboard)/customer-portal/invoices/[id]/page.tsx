import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoice } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "overdue":
    case "cancelled":
      return "destructive" as const;
    case "draft":
      return "secondary" as const;
    case "partially_paid":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LineItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const { id } = await params;
  const invoice = await getInvoice(id, session.tenantId);
  if (!invoice) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "portal:edit"
  );

  const lineItems = Array.isArray(invoice.lineItems)
    ? (invoice.lineItems as LineItem[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customer-portal/invoices"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {invoice.invoiceRef}
            </h1>
            <p className="text-sm text-gray-500">Invoice Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/customer-portal/invoices/${invoice.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Invoice Information
          </h2>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Invoice Ref</p>
            <p className="mt-1 text-sm text-gray-900">{invoice.invoiceRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Invoice Type</p>
            <p className="mt-1 text-sm text-gray-900">{invoice.invoiceType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Currency</p>
            <p className="mt-1 text-sm text-gray-900">{invoice.currency}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Subtotal</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(invoice.subtotal, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tax Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(invoice.taxAmount, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Amount</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAmount(invoice.totalAmount, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Paid Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatAmount(invoice.paidAmount, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Balance Due</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAmount(invoice.balanceDue, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Issued At</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(invoice.issuedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Paid At</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(invoice.paidAt)}
            </p>
          </div>
        </div>
        {invoice.notes && (
          <div className="border-t px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {lineItems.length > 0 && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-start font-medium text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-end font-medium text-gray-500">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-end font-medium text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-end font-medium text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-900">
                      {item.description ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-end text-gray-600">
                      {item.quantity ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-end text-gray-600">
                      {item.unitPrice != null
                        ? formatAmount(item.unitPrice, invoice.currency)
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-end text-gray-600">
                      {item.amount != null
                        ? formatAmount(item.amount, invoice.currency)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
