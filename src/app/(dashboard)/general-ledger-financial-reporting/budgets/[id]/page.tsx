import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBudget } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/general-ledger-financial-reporting");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "gl:edit"
  );

  const { id } = await params;
  const record = await getBudget(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/general-ledger-financial-reporting/budgets"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.budgetRef}
            </h1>
            <p className="text-sm text-gray-500">
              {record.budgetType} &middot; {record.budgetName || "Unnamed"}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/general-ledger-financial-reporting/budgets/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Budget Details
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Budget Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.budgetRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Budget Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.budgetType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Budget Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.budgetName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Fiscal Year</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.fiscalYear ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.periodStart
                ? new Date(record.periodStart).toLocaleDateString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.periodEnd
                ? new Date(record.periodEnd).toLocaleDateString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.department ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Cost Center</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.costCenter ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Total Budgeted
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalBudgeted ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Actual</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalActual ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Total Variance
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalVariance ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Variance Percentage
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.variancePercentage ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Current Revision
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currentRevision ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Prepared By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.preparedBy ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.approvedBy ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "submitted"
                      ? "default"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {record.notes ?? "--"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
