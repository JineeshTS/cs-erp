import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyAvailabilityPlans } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function AvailabilityPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const record = await db
    .select()
    .from(eqyAvailabilityPlans)
    .where(
      and(
        eq(eqyAvailabilityPlans.id, id),
        eq(eqyAvailabilityPlans.tenantId, session.tenantId),
        isNull(eqyAvailabilityPlans.deletedAt)
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

  const statusVariant = (s: string) => {
    switch (s) {
      case "completed":
        return "success" as const;
      case "approved":
        return "default" as const;
      case "executing":
        return "default" as const;
      case "forecast":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/availability-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.planReference}
          </h1>
          <p className="text-sm text-gray-500">
            Availability Plan &middot; {record.tradeLane || "No trade lane"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/availability-plans/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan Reference</dt>
            <dd className="mt-1 text-gray-900">{record.planReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-gray-900">{record.tradeLane || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{record.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{record.destinationPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{record.containerType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Size</dt>
            <dd className="mt-1 text-gray-900">{record.containerSize || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Period Start</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.forecastPeriodStart)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Period End</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.forecastPeriodEnd)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Available Units</dt>
            <dd className="mt-1 text-gray-900">
              {record.availableUnits !== null ? record.availableUnits : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Demand Forecast</dt>
            <dd className="mt-1 text-gray-900">
              {record.demandForecast !== null ? record.demandForecast : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surplus / Deficit</dt>
            <dd className="mt-1 text-gray-900">
              {record.surplusDeficit !== null ? record.surplusDeficit : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Recommended Action</dt>
            <dd className="mt-1 text-gray-900">
              {record.recommendedAction ? record.recommendedAction.replace(/_/g, " ") : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Confidence</dt>
            <dd className="mt-1 text-gray-900">
              {record.aiConfidence !== null ? Number(record.aiConfidence) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model</dt>
            <dd className="mt-1 text-gray-900">{record.aiModel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Executed Action</dt>
            <dd className="mt-1 text-gray-900">
              {record.executedAction ? record.executedAction.replace(/_/g, " ") : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Execution Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.executionDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
