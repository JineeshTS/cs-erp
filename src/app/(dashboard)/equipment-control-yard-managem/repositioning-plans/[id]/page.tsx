import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyRepositioningPlans } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function RepositioningPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem/repositioning-plans");

  const { id } = await params;

  const record = await db
    .select()
    .from(eqyRepositioningPlans)
    .where(
      and(
        eq(eqyRepositioningPlans.id, id),
        eq(eqyRepositioningPlans.tenantId, session.tenantId),
        isNull(eqyRepositioningPlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:delete"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "completed":
        return "success" as const;
      case "in_transit":
        return "default" as const;
      case "approved":
        return "secondary" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/repositioning-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.planReference}
          </h1>
          <p className="text-sm text-gray-500">
            {record.fromPort} &rarr; {record.toPort}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/equipment-control-yard-managem/repositioning-plans/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/equipment-control-yard-managem/repositioning-plans/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Plan Reference", value: record.planReference },
            { label: "Container Number", value: record.containerNumber ?? "-" },
            { label: "From Port", value: record.fromPort },
            { label: "To Port", value: record.toPort },
            { label: "Trade Lane", value: record.tradeLane ?? "-" },
            {
              label: "Estimated Cost",
              value: record.estimatedCost
                ? `${record.estimatedCost.toLocaleString()} ${record.currency}`
                : "-",
            },
            { label: "Currency", value: record.currency },
            {
              label: "Transport Mode",
              value: record.transportMode.replace(/_/g, " "),
            },
            { label: "Scheduled Date", value: fmtDate(record.scheduledDate) },
            { label: "Completed Date", value: fmtDate(record.completedDate) },
            {
              label: "Reason",
              value: record.reason.replace(/_/g, " "),
            },
            { label: "Container Type", value: record.containerType ?? "-" },
            { label: "Container Size", value: record.containerSize ?? "-" },
            {
              label: "Quantity",
              value: record.quantity?.toString() ?? "-",
            },
            {
              label: "Status",
              value: (
                <Badge variant={statusVariant(record.status)}>
                  {record.status.replace(/_/g, " ")}
                </Badge>
              ),
            },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <div className="mt-0.5 text-sm text-gray-900">{field.value}</div>
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
