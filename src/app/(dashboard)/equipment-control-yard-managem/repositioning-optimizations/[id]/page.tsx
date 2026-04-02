import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyRepositioningOptimizations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function RepositioningOptimizationDetailPage({
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
    .from(eqyRepositioningOptimizations)
    .where(
      and(
        eq(eqyRepositioningOptimizations.id, id),
        eq(eqyRepositioningOptimizations.tenantId, session.tenantId),
        isNull(eqyRepositioningOptimizations.deletedAt)
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
        return "success" as const;
      case "running":
        return "default" as const;
      case "failed":
        return "destructive" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/repositioning-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.optimizationRunId || record.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Repositioning Optimization &middot; {record.originPort} to {record.destinationPort}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/repositioning-optimizations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Optimization Run ID</dt>
            <dd className="mt-1 text-gray-900">{record.optimizationRunId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan Reference</dt>
            <dd className="mt-1 text-gray-900">{record.planReference || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{record.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{record.destinationPort}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Quantity</dt>
            <dd className="mt-1 text-gray-900">
              {record.quantity !== null ? record.quantity : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transport Mode</dt>
            <dd className="mt-1 text-gray-900">
              {record.transportMode ? record.transportMode.replace(/_/g, " ") : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCost !== null ? record.estimatedCost.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Days</dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedDays !== null ? record.estimatedDays : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Carbon</dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCarbon !== null ? Number(record.estimatedCarbon) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Score</dt>
            <dd className="mt-1 text-gray-900">
              {record.aiScore !== null ? Number(record.aiScore) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model</dt>
            <dd className="mt-1 text-gray-900">{record.aiModel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Algorithm</dt>
            <dd className="mt-1 text-gray-900">{record.algorithm || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Selected for Execution</dt>
            <dd className="mt-1 text-gray-900">
              {record.selectedForExecution ? "Yes" : "No"}
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
