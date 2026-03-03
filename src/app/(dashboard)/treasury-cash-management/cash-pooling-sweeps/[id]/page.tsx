import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashPoolingSweep } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CashPoolingSweepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;

  const record = await getCashPoolingSweep(id, session.tenantId);
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
          href="/treasury-cash-management/cash-pooling-sweeps"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.sweepRef}
          </h1>
          <p className="text-sm text-gray-500">
            Cash Pooling & Sweep Details
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/cash-pooling-sweeps/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Sweep Ref</dt>
            <dd className="mt-1 text-gray-900">{record.sweepRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sweep Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.sweepType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Pool Name</dt>
            <dd className="mt-1 text-gray-900">{record.poolName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Master Account Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.masterAccountRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sweep Direction
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.sweepDirection || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trigger Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.triggerBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Target Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.targetBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sweep Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.sweepAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Frequency</dt>
            <dd className="mt-1 text-gray-900">{record.frequency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Executed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastExecutedAt
                ? new Date(record.lastExecutedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Next Scheduled At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.nextScheduledAt
                ? new Date(record.nextScheduledAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Interest Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.interestRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Pool Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalPoolBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "completed"
                      ? "default"
                      : "warning"
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
