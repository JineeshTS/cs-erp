import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmInvoice } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  draft: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "destructive",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const invoice = await getDdmInvoice(id, session.tenantId);
  if (!invoice) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {invoice.invoiceRef}
          </h1>
          <p className="text-sm text-gray-500">
            D&D Invoice &middot; {invoice.invoiceType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/invoices/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Invoice Ref</dt>
            <dd className="mt-1 text-gray-900">{invoice.invoiceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Type</dt>
            <dd className="mt-1 text-gray-900">{invoice.invoiceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{invoice.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Code</dt>
            <dd className="mt-1 text-gray-900">{invoice.customerCode ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{invoice.containerNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{invoice.bookingRef ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">{invoice.blNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Demurrage Amount</dt>
            <dd className="mt-1 text-gray-900">{invoice.demurrageAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Detention Amount</dt>
            <dd className="mt-1 text-gray-900">{invoice.detentionAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-gray-900">{invoice.subtotal ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Rate</dt>
            <dd className="mt-1 text-gray-900">{invoice.taxRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">{invoice.taxAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.currency} {invoice.totalAmount}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{invoice.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Paid Date</dt>
            <dd className="mt-1 text-gray-900">
              {invoice.paidDate
                ? new Date(invoice.paidDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
            <dd className="mt-1 text-gray-900">{invoice.paidAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dispatch Method</dt>
            <dd className="mt-1 text-gray-900">{invoice.dispatchMethod ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
            <dd className="mt-1 text-gray-900">{invoice.customerEmail ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[invoice.status] ?? "secondary"}
              >
                {invoice.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{invoice.notes ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
