import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpendAnalytic } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  archived: "secondary",
} as const;

export default async function SpendAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const { id } = await params;

  const record = await getSpendAnalytic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "procurement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/spend-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analyticsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.title || "Spend Analytic"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/procurement-supply-chain/spend-analytics/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Analytics Ref</dt>
            <dd className="mt-1 text-gray-900">{record.analyticsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analytics Type</dt>
            <dd className="mt-1 text-gray-900">{record.analyticsType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analysis Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {record.analysisPeriodStart
                ? new Date(record.analysisPeriodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Analysis Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.analysisPeriodEnd
                ? new Date(record.analysisPeriodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Spend</dt>
            <dd className="mt-1 text-gray-900">{record.totalSpend ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Savings Identified</dt>
            <dd className="mt-1 text-gray-900">{record.savingsIdentified ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Savings Realized</dt>
            <dd className="mt-1 text-gray-900">{record.savingsRealized ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Next Period</dt>
            <dd className="mt-1 text-gray-900">{record.forecastNextPeriod ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence Score</dt>
            <dd className="mt-1 text-gray-900">{record.confidenceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model Used</dt>
            <dd className="mt-1 text-gray-900">{record.aiModelUsed || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Data Points</dt>
            <dd className="mt-1 text-gray-900">{record.dataPoints ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Generated By</dt>
            <dd className="mt-1 text-gray-900">{record.generatedBy || "-"}</dd>
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
