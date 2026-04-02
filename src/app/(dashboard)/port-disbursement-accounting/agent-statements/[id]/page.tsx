import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgentStatement } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function AgentStatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const { id } = await params;

  const record = await getAgentStatement(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/agent-statements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.statementRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.agentName} &middot; {record.portName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-disbursement-accounting/agent-statements/${id}/edit`}
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
              Statement Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.statementRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Name</dt>
            <dd className="mt-1 text-gray-900">{record.agentName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.agentCode || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.portCode || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.portName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Statement Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.statementDate
                ? new Date(record.statementDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodFrom
                ? new Date(record.periodFrom).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodTo
                ? new Date(record.periodTo).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {record.currency || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Opening Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.openingBalance != null
                ? record.openingBalance.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Debits
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalDebits != null
                ? record.totalDebits.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Credits
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCredits != null
                ? record.totalCredits.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Closing Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.closingBalance.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transaction Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transactionCount != null
                ? record.transactionCount.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Advance Paid
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.advancePaid != null
                ? record.advancePaid.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Balance Due</dt>
            <dd className="mt-1 text-gray-900">
              {record.balanceDue.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.dueDate
                ? new Date(record.dueDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledByName || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledAt
                ? new Date(record.reconciledAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "reconciled"
                    ? "success"
                    : record.status === "disputed"
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
            <dd className="mt-1 text-gray-900">{record.notes || "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
