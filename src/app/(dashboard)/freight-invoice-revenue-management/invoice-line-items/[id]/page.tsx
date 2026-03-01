import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoiceLineItem } from "@/lib/freight-invoice-revenue-management/service";

export default async function InvoiceLineItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;

  const lineItem = await getInvoiceLineItem(id, session.tenantId);
  if (!lineItem) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/invoice-line-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Line Item #{lineItem.lineNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {lineItem.chargeCode} &middot; {lineItem.description.slice(0, 60)}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/invoice-line-items/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Line Number</dt>
            <dd className="mt-1 text-gray-900">{lineItem.lineNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charge Code</dt>
            <dd className="mt-1 text-gray-900">{lineItem.chargeCode}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {lineItem.description}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.containerType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Quantity</dt>
            <dd className="mt-1 text-gray-900">{lineItem.quantity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.unitPrice?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{lineItem.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.amount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Rate</dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.taxRate?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.taxAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {lineItem.totalAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tariff Ref</dt>
            <dd className="mt-1 text-gray-900">
              {lineItem.tariffRef || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {lineItem.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
