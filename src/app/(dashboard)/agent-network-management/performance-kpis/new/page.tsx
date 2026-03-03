import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewPerformanceKpiPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "anm:create"))
  )
    redirect("/agent-network-management/performance-kpis");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/agent-network-management/performance-kpis"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Performance KPI
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AnmForm
          entityType="Performance KPI"
          apiPath="/api/v1/agent-network-management/performance-kpis"
          fields={PERFORMANCE_KPI_FIELDS}
          returnPath="/agent-network-management/performance-kpis"
        />
      </div>
    </div>
  );
}
