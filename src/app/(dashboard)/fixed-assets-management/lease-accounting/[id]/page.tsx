import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeaseAccount } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  expired: "secondary",
  terminated: "destructive",
  pending: "warning",
} as const;

export default async function LeaseAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getLeaseAccount(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/lease-accounting"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.leaseRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assetName || "Lease Account"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fixed-assets-management/lease-accounting/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Lease Ref</dt>
            <dd className="mt-1 text-gray-900">{record.leaseRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease Type</dt>
            <dd className="mt-1 text-gray-900">{record.leaseType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assetRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-gray-900">{record.assetName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lessor Name</dt>
            <dd className="mt-1 text-gray-900">{record.lessorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease Start Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.leaseStartDate
                ? new Date(record.leaseStartDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease End Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.leaseEndDate
                ? new Date(record.leaseEndDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease Term (Months)</dt>
            <dd className="mt-1 text-gray-900">
              {record.leaseTermMonths ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Monthly Payment</dt>
            <dd className="mt-1 text-gray-900">
              {record.monthlyPayment ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Annual Payment</dt>
            <dd className="mt-1 text-gray-900">
              {record.annualPayment ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Lease Payments</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalLeasePayments ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Discount Rate</dt>
            <dd className="mt-1 text-gray-900">
              {record.discountRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ROU Asset Value</dt>
            <dd className="mt-1 text-gray-900">
              {record.rouAssetValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease Liability</dt>
            <dd className="mt-1 text-gray-900">
              {record.leaseLiability ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accumulated Depreciation</dt>
            <dd className="mt-1 text-gray-900">
              {record.accumulatedDepreciation ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Interest Expense</dt>
            <dd className="mt-1 text-gray-900">
              {record.interestExpense ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Renewal Option</dt>
            <dd className="mt-1 text-gray-900">
              {record.renewalOption ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Purchase Option</dt>
            <dd className="mt-1 text-gray-900">
              {record.purchaseOption ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Termination Option</dt>
            <dd className="mt-1 text-gray-900">
              {record.terminationOption ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
