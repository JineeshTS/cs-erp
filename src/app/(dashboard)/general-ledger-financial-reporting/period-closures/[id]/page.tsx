import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPeriodClosure } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function PeriodClosureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/general-ledger-financial-reporting");

  const { id } = await params;
  const record = await getPeriodClosure(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "gl:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/general-ledger-financial-reporting/period-closures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.closureRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.closureType} &middot; {record.periodName || "No period"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/general-ledger-financial-reporting/period-closures/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Closure Ref</dt>
            <dd className="mt-1 text-gray-900">{record.closureRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closure Type</dt>
            <dd className="mt-1 text-gray-900">{record.closureType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodName || "-"}
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
            <dt className="text-sm font-medium text-gray-500">Fiscal Month</dt>
            <dd className="mt-1 text-gray-900">
              {record.fiscalMonth ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Completed Steps
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.completedSteps ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Steps</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalSteps ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closed By</dt>
            <dd className="mt-1 text-gray-900">
              {record.closedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.closedAt
                ? new Date(record.closedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "closed"
                    ? "success"
                    : record.status === "in_progress"
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
