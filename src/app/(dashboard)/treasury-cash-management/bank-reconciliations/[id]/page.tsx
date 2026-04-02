import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankReconciliation } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BankReconciliationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;

  const record = await getBankReconciliation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "treasury:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/bank-reconciliations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.reconciliationRef}
          </h1>
          <p className="text-sm text-gray-500">
            Bank Reconciliation Details
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/bank-reconciliations/${id}/edit`}
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
              Reconciliation Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.reconciliationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciliation Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciliationType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bank Account Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bankAccountRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-gray-900">{record.bankName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodStart
                ? new Date(record.periodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodEnd
                ? new Date(record.periodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Statement Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.statementBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Book Balance</dt>
            <dd className="mt-1 text-gray-900">
              {record.bookBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Unreconciled Items
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.unreconciledItems ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Matched Transactions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.matchedTransactions ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Difference</dt>
            <dd className="mt-1 text-gray-900">{record.difference ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledAt
                ? new Date(record.reconciledAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "completed"
                      ? "default"
                      : record.status === "in_progress"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
