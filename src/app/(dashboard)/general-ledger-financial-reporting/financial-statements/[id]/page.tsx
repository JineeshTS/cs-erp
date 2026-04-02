import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFinancialStatement } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function FinancialStatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/general-ledger-financial-reporting");

  const { id } = await params;
  const record = await getFinancialStatement(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "gl:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/general-ledger-financial-reporting/financial-statements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.statementRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.statementType} &middot;{" "}
            {record.reportingStandard || "No standard"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/general-ledger-financial-reporting/financial-statements/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Statement Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.statementType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Standard
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingStandard || "-"}
            </dd>
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
            <dt className="text-sm font-medium text-gray-500">Fiscal Year</dt>
            <dd className="mt-1 text-gray-900">
              {record.fiscalYear ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.entityId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Assets
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalAssets ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Liabilities
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalLiabilities ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Equity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalEquity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Income</dt>
            <dd className="mt-1 text-gray-900">
              {record.netIncome ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Generated By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.generatedBy || "-"}
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
                  record.status === "published"
                    ? "success"
                    : record.status === "approved"
                      ? "default"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
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
