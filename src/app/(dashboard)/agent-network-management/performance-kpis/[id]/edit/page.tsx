import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPerformanceKpi } from "@/lib/agent-network-management/service";
import { AnmForm, type FieldConfig } from "@/components/agent-network-management/anm-form";

const PERFORMANCE_KPI_FIELDS: FieldConfig[] = [
  {
    name: "kpiType",
    label: "KPI Type",
    type: "select",
    required: true,
    options: [
      { value: "volume_target", label: "Volume Target" },
      { value: "revenue_target", label: "Revenue Target" },
      { value: "customer_acquisition", label: "Customer Acquisition" },
      { value: "service_quality", label: "Service Quality" },
      { value: "collection_efficiency", label: "Collection Efficiency" },
    ],
  },
  { name: "agentName", label: "Agent Name", type: "text" },
  { name: "agentCode", label: "Agent Code", type: "text" },
  { name: "kpiPeriod", label: "KPI Period", type: "text" },
  { name: "targetValue", label: "Target Value", type: "text" },
  { name: "actualValue", label: "Actual Value", type: "text" },
  { name: "achievementPct", label: "Achievement %", type: "text" },
  { name: "kpiCurrency", label: "KPI Currency", type: "text" },
  { name: "ranking", label: "Ranking", type: "number" },
  { name: "trendDirection", label: "Trend Direction", type: "text" },
  { name: "benchmarkValue", label: "Benchmark Value", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPerformanceKpiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/agent-network-management/performance-kpis");

  const { id } = await params;

  const record = await getPerformanceKpi(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/agent-network-management/performance-kpis/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Performance KPI
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AnmForm
          entityType="Performance KPI"
          apiPath={`/api/v1/agent-network-management/performance-kpis/${id}`}
          fields={PERFORMANCE_KPI_FIELDS}
          initialData={{
            kpiType: record.kpiType,
            agentName: record.agentName ?? "",
            agentCode: record.agentCode ?? "",
            kpiPeriod: record.kpiPeriod ?? "",
            targetValue: record.targetValue ?? "",
            actualValue: record.actualValue ?? "",
            achievementPct: record.achievementPct ?? "",
            kpiCurrency: record.kpiCurrency ?? "",
            ranking: record.ranking ?? "",
            trendDirection: record.trendDirection ?? "",
            benchmarkValue: record.benchmarkValue ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/agent-network-management/performance-kpis/${id}`}
        />
      </div>
    </div>
  );
}
