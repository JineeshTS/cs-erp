import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmIncentiveRules } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function IncentiveRuleDetailPage({
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
    .from(scmIncentiveRules)
    .where(
      and(
        eq(scmIncentiveRules.id, id),
        eq(scmIncentiveRules.tenantId, session.tenantId),
        isNull(scmIncentiveRules.deletedAt)
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
          href="/sales-crm/incentive-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.ruleName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.ruleCode} &mdash;{" "}
            <Badge
              variant={record.isActive ? "default" : "secondary"}
            >
              {record.isActive ? "Active" : "Inactive"}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales-crm/incentive-rules/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/sales-crm/incentive-rules/${id}`} />
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Rule Name", value: record.ruleName },
            { label: "Rule Code", value: record.ruleCode },
            { label: "Target Type", value: record.targetType.replace(/_/g, " ") },
            { label: "Threshold %", value: `${record.thresholdPercent}%` },
            { label: "Commission Rate", value: record.commissionRate.toString() },
            { label: "Bonus Amount", value: record.bonusAmount?.toLocaleString() ?? "-" },
            { label: "Currency", value: record.currency ?? "USD" },
            { label: "Capped At", value: record.cappedAt?.toLocaleString() ?? "-" },
            { label: "Effective From", value: new Date(record.effectiveFrom).toLocaleString() },
            { label: "Effective To", value: record.effectiveTo ? new Date(record.effectiveTo).toLocaleString() : "-" },
            { label: "Applies To", value: record.appliesTo?.replace(/_/g, " ") ?? "all" },
            { label: "Region", value: record.region ?? "-" },
            { label: "Trade Lane", value: record.tradeLane ?? "-" },
            { label: "Is Active", value: record.isActive ? "Yes" : "No" },
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
