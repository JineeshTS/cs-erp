import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getThreeWayMatch } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ThreeWayMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/");

  const { id } = await params;
  const record = await getThreeWayMatch(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "payable:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/three-way-matches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.matchRef}</h1>
          <p className="text-sm text-gray-500">Three-Way Match &middot; {record.vendorName}</p>
        </div>
        {canEdit && (
          <Link
            href={`/accounts-payable-vendor-management/three-way-matches/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Match Ref</dt>
            <dd className="mt-1 text-gray-900">{record.matchRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-gray-900">{record.invoiceNumber ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PO Number</dt>
            <dd className="mt-1 text-gray-900">{record.poNumber ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PO Amount</dt>
            <dd className="mt-1 text-gray-900">{record.poAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">GR Amount</dt>
            <dd className="mt-1 text-gray-900">{record.grAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Amount</dt>
            <dd className="mt-1 text-gray-900">{record.invoiceAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance Amount</dt>
            <dd className="mt-1 text-gray-900">{record.varianceAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance Percent</dt>
            <dd className="mt-1 text-gray-900">{record.variancePercent?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tolerance Percent</dt>
            <dd className="mt-1 text-gray-900">{record.tolerancePercent?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Within Tolerance</dt>
            <dd className="mt-1 text-gray-900">{record.withinTolerance ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Price Match</dt>
            <dd className="mt-1 text-gray-900">{record.priceMatch ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Quantity Match</dt>
            <dd className="mt-1 text-gray-900">{record.quantityMatch ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auto Matched</dt>
            <dd className="mt-1 text-gray-900">{record.autoMatched ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Matched By</dt>
            <dd className="mt-1 text-gray-900">{record.matchedByName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Matched At</dt>
            <dd className="mt-1 text-gray-900">{record.matchedAt ? new Date(record.matchedAt).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exception Reason</dt>
            <dd className="mt-1 text-gray-900">{record.exceptionReason ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resolved By</dt>
            <dd className="mt-1 text-gray-900">{record.resolvedByName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
            <dd className="mt-1 text-gray-900">{record.resolvedAt ? new Date(record.resolvedAt).toLocaleString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={record.status === "matched" ? "success" : record.status === "pending" ? "secondary" : "destructive"}>{record.status}</Badge>
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
