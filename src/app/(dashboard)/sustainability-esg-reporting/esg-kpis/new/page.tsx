import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { SerForm } from "@/components/sustainability-esg-reporting/ser-form";
import type { FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const fields: FieldConfig[] = [
  {
    name: "kpiType",
    label: "KPI Type",
    type: "select",
    required: true,
    options: [
      { value: "environmental_metric", label: "Environmental Metric" },
      { value: "social_metric", label: "Social Metric" },
      { value: "governance_metric", label: "Governance Metric" },
      { value: "combined_score", label: "Combined Score" },
      { value: "benchmark_index", label: "Benchmark Index" },
    ],
  },
  { name: "kpiName", label: "KPI Name", type: "text" },
  { name: "kpiCategory", label: "KPI Category", type: "text" },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "targetValue", label: "Target Value", type: "text" },
  { name: "actualValue", label: "Actual Value", type: "text" },
  { name: "achievementPct", label: "Achievement %", type: "text" },
  { name: "benchmarkValue", label: "Benchmark Value", type: "text" },
  { name: "benchmarkSource", label: "Benchmark Source", type: "text" },
  { name: "trendDirection", label: "Trend Direction", type: "text" },
  { name: "rating", label: "Rating", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewEsgKpiPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:create")))
    redirect("/sustainability-esg-reporting/esg-kpis");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sustainability-esg-reporting/esg-kpis"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to ESG KPIs
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">New ESG KPI</h1>
      </div>

      <SerForm
        entityType="ESG KPI"
        apiPath="/api/v1/sustainability-esg-reporting/esg-kpis"
        fields={fields}
        returnPath="/sustainability-esg-reporting/esg-kpis"
      />
    </div>
  );
}
