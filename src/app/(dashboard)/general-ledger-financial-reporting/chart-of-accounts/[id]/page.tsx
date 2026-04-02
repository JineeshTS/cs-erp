import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getChartOfAccount } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function ChartOfAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "gl:edit"
  );

  const { id } = await params;
  const record = await getChartOfAccount(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/general-ledger-financial-reporting/chart-of-accounts"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.accountRef}
            </h1>
            <p className="text-sm text-gray-500">
              {record.accountType} &middot; {record.accountCode}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/general-ledger-financial-reporting/chart-of-accounts/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Details
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.accountRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Code</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.accountCode}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.accountName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.accountType}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Parent Account ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.parentAccountId ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Account Level
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.accountLevel ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Normal Balance
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.normalBalance ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Is Control Account
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.isControlAccount ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Is Reconcilable
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.isReconcilable ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Is Bank Account
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.isBankAccount ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Segment</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.segment ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Cost Center</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.costCenter ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.department ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Tax Code</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.taxCode ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Opening Balance
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.openingBalance ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Current Balance
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currentBalance ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.description ?? "--"}
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
