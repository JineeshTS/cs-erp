import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVarianceAnalysis } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function VarianceAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const analysis = await getVarianceAnalysis(id, session.tenantId);
  if (!analysis) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Analysis Ref", value: analysis.analysisRef },
    { label: "Voyage Ref", value: analysis.voyageRef },
    { label: "Vessel Name", value: analysis.vesselName },
    { label: "Cost Centre", value: analysis.costCentre },
    { label: "Analysis Period", value: analysis.analysisPeriod },
    { label: "Analysis Type", value: analysis.analysisType },
    { label: "Currency", value: analysis.currency },
    { label: "Budget Amount", value: analysis.budgetAmount },
    { label: "Actual Amount", value: analysis.actualAmount },
    { label: "Variance Amount", value: analysis.varianceAmount },
    {
      label: "Variance %",
      value:
        analysis.variancePercent != null
          ? `${analysis.variancePercent}%`
          : null,
    },
    { label: "Variance Type", value: analysis.varianceType },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            analysis.status === "closed" || analysis.status === "reviewed"
              ? "success"
              : "secondary"
          }
        >
          {analysis.status}
        </Badge>
      ),
    },
    {
      label: "Reviewed At",
      value: analysis.reviewedAt
        ? new Date(analysis.reviewedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: analysis.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/variance-analyses"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {analysis.analysisRef}
            </h1>
            <p className="text-sm text-gray-500">Variance Analysis Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/variance-analyses/${analysis.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
