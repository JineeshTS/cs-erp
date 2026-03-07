import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProfitBenchmark } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditProfitBenchmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "benchmarkType",
      label: "Benchmark Type",
      type: "select",
      required: true,
      options: [
        { value: "vessel_comparison", label: "Vessel Comparison" },
        { value: "route_comparison", label: "Route Comparison" },
        { value: "period_comparison", label: "Period Comparison" },
        { value: "peer_comparison", label: "Peer Comparison" },
        { value: "ai_recommendation", label: "AI Recommendation" },
      ],
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: false,
    },
    {
      name: "voyageNumber",
      label: "Voyage Number",
      type: "text",
      required: false,
    },
    {
      name: "vesselName",
      label: "Vessel Name",
      type: "select", options: vesselOpts,
      required: false,
    },
    {
      name: "tradeLane",
      label: "Trade Lane",
      type: "text",
      required: false,
    },
    {
      name: "actualTce",
      label: "Actual TCE",
      type: "number",
      required: false,
    },
    {
      name: "benchmarkTce",
      label: "Benchmark TCE",
      type: "number",
      required: false,
    },
    {
      name: "varianceTce",
      label: "Variance TCE",
      type: "number",
      required: false,
    },
    {
      name: "actualMargin",
      label: "Actual Margin",
      type: "number",
      required: false,
    },
    {
      name: "benchmarkMargin",
      label: "Benchmark Margin",
      type: "number",
      required: false,
    },
    {
      name: "performanceScore",
      label: "Performance Score",
      type: "number",
      required: false,
    },
    {
      name: "aiInsights",
      label: "AI Insights",
      type: "textarea",
      required: false,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      required: false,
    },
  ];

  const { id } = await params;
  const record = await getProfitBenchmark(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/profit-benchmarks/${id}`}
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profit Benchmark</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <VrsForm
          entityType="Profit Benchmark"
          apiPath={`/api/v1/voyage-results-settlement/profit-benchmarks/${id}`}
          fields={fields}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/voyage-results-settlement/profit-benchmarks/${id}`}
        />
      </div>
    </div>
  );
}
