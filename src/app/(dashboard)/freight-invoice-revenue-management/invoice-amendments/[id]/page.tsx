import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoiceAmendment } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

export default async function InvoiceAmendmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const amendment = await getInvoiceAmendment(id, session.tenantId);
  if (!amendment) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  function statusVariant(s: string) {
    switch (s) {
      case "approved":
        return "success" as const;
      case "rejected":
        return "destructive" as const;
      case "pending_approval":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/invoice-amendments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {amendment.amendmentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {amendment.amendmentType} &middot; Invoice{" "}
            {amendment.originalInvoiceNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/invoice-amendments/${id}/edit`}
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
              Amendment Ref
            </dt>
            <dd className="mt-1 text-gray-900">{amendment.amendmentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Original Invoice Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {amendment.originalInvoiceNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Amendment Type
            </dt>
            <dd className="mt-1 text-gray-900">{amendment.amendmentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-gray-900">{amendment.reason}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {amendment.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Previous Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {amendment.previousAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">New Amount</dt>
            <dd className="mt-1 text-gray-900">
              {amendment.newAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Adjustment Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {amendment.adjustmentAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{amendment.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              New Invoice Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {amendment.newInvoiceNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(amendment.status)}>
                {amendment.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {amendment.approvedAt
                ? new Date(amendment.approvedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {amendment.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
