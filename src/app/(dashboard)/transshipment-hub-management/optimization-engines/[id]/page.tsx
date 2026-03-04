import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOptimizationEngine } from "@/lib/transshipment-hub-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function OptimizationEngineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:read")))
    redirect("/transshipment-hub-management");

  const { id } = await params;

  const record = await getOptimizationEngine(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "thm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/optimization-engines"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.engineRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.engineType?.replace(/_/g, " ")} &middot; {record.scenarioName || "No scenario name"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/transshipment-hub-management/optimization-engines/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Engine Ref</dt>
            <dd className="mt-1 text-gray-900">{record.engineRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Engine Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.engineType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hub Port</dt>
            <dd className="mt-1 text-gray-900">{record.hubPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scenario Name</dt>
            <dd className="mt-1 text-gray-900">{record.scenarioName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Cost</dt>
            <dd className="mt-1 text-gray-900">{record.currentCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optimized Cost</dt>
            <dd className="mt-1 text-gray-900">{record.optimizedCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Savings Amount</dt>
            <dd className="mt-1 text-gray-900">{record.savingsAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Savings %</dt>
            <dd className="mt-1 text-gray-900">{record.savingsPct ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">{record.modelVersion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence Score</dt>
            <dd className="mt-1 text-gray-900">{record.confidenceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accepted</dt>
            <dd className="mt-1 text-gray-900">{record.accepted ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
