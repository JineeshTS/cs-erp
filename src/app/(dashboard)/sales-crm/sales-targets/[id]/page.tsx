import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmSalesTargets } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SalesTargetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:read")))
    redirect("/sales-crm");

  const { id } = await params;

  const record = await db
    .select()
    .from(scmSalesTargets)
    .where(
      and(
        eq(scmSalesTargets.id, id),
        eq(scmSalesTargets.tenantId, session.tenantId),
        isNull(scmSalesTargets.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "sales:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "sales:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/sales-targets"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.targetName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.targetType.replace(/_/g, " ")} &mdash; FY {record.fiscalYear} &mdash;{" "}
            <Badge
              variant={
                record.status === "achieved"
                  ? "default"
                  : record.status === "missed" || record.status === "cancelled"
                    ? "destructive"
                    : record.status === "active"
                      ? "secondary"
                      : "outline"
              }
            >
              {record.status.replace(/_/g, " ")}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales-crm/sales-targets/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/sales-crm/sales-targets/${id}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Sales Rep ID", value: record.salesRepId },
            { label: "Target Name", value: record.targetName },
            { label: "Target Type", value: record.targetType.replace(/_/g, " ") },
            { label: "Fiscal Year", value: record.fiscalYear.toString() },
            { label: "Fiscal Quarter", value: record.fiscalQuarter?.toString() ?? "-" },
            { label: "Fiscal Month", value: record.fiscalMonth?.toString() ?? "-" },
            { label: "Revenue Target", value: record.revenueTarget?.toLocaleString() ?? "-" },
            { label: "TEU Target", value: record.teuTarget?.toLocaleString() ?? "-" },
            { label: "New Customer Target", value: record.newCustomerTarget?.toLocaleString() ?? "-" },
            { label: "Revenue Actual", value: record.revenueActual?.toLocaleString() ?? "-" },
            { label: "TEU Actual", value: record.teuActual?.toLocaleString() ?? "-" },
            { label: "New Customer Actual", value: record.newCustomerActual?.toLocaleString() ?? "-" },
            { label: "Currency", value: record.currency ?? "USD" },
            { label: "Trade Lane", value: record.tradeLane ?? "-" },
            { label: "Region", value: record.region ?? "-" },
            { label: "Status", value: record.status.replace(/_/g, " ") },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
