import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashPosition } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CashPositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const { id } = await params;

  const record = await getCashPosition(id, session.tenantId);
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
          href="/treasury-cash-management/cash-positions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.positionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.positionType} &middot;{" "}
            {record.positionDate
              ? new Date(record.positionDate).toLocaleDateString()
              : "No date"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/treasury-cash-management/cash-positions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Position Ref</dt>
            <dd className="mt-1 text-gray-900">{record.positionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Position Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.positionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Position Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.positionDate
                ? new Date(record.positionDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Opening Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.openingBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Inflows
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalInflows ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Outflows
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalOutflows ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Closing Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.closingBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Net Cash Flow
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.netCashFlow ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Minimum Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.minimumBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Maximum Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maximumBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bank Account ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bankAccountId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 text-gray-900">{record.entityId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance</dt>
            <dd className="mt-1 text-gray-900">{record.variance ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Percentage
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.variancePercentage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "finalized"
                    ? "success"
                    : record.status === "confirmed"
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
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
