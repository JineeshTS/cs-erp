import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPurchaseOrder } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/accounts-payable-vendor-management");

  const { id } = await params;
  const record = await getPurchaseOrder(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "payable:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/purchase-orders"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.poNumber}
          </h1>
          <p className="text-sm text-gray-500">{record.vendorName}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/accounts-payable-vendor-management/purchase-orders/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">PO Number</dt>
            <dd className="mt-1 text-gray-900">{record.poNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.vendorCode ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PO Type</dt>
            <dd className="mt-1 text-gray-900">{record.poType}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {record.description ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-gray-900">
              {record.subtotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
            <dd className="mt-1 text-gray-900">
              {record.taxAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Delivery Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.deliveryDate
                ? new Date(record.deliveryDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Delivery Address
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.deliveryAddress ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Terms
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.paymentTerms ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Budget Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.budgetCode ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Centre</dt>
            <dd className="mt-1 text-gray-900">
              {record.costCentre ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requested By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.requestedByName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedByName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Received Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.receivedAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Invoiced Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.invoicedAmount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "draft"
                      ? "secondary"
                      : record.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
