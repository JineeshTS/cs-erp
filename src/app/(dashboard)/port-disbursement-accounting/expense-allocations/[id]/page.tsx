import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExpenseAllocation } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function ExpenseAllocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;
  const record = await getExpenseAllocation(id, session.tenantId);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  function statusVariant(status: string) {
    switch (status) {
      case "posted":
        return "success" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/expense-allocations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.allocationRef}
          </h1>
          <p className="text-sm text-gray-500">Expense Allocation Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-disbursement-accounting/expense-allocations/${id}/edit`}
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
              Allocation Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.allocationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">{record.portCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FDA Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.fdaRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Port Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalPortCost.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocation Method
            </dt>
            <dd className="mt-1 text-gray-900">{record.allocationMethod}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocation Basis
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.allocationBasis || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated to Cargo
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.allocatedToCargo.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated to Vessel
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.allocatedToVessel.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated to Overhead
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.allocatedToOverhead.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Centre</dt>
            <dd className="mt-1 text-gray-900">
              {record.costCentre || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              GL Account Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.glAccountCode || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Journal Entry Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.journalEntryRef || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Posted At</dt>
            <dd className="mt-1 text-gray-900">
              {record.postedAt
                ? new Date(record.postedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocated By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.allocatedByName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
