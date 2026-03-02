import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCostBenchmark } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function CostBenchmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "disbursement:read"
    ))
  )
    redirect("/port-disbursement-accounting");

  const { id } = await params;
  const record = await getCostBenchmark(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:edit"
  );

  const details = [
    { label: "Benchmark Ref", value: record.benchmarkRef },
    { label: "Port Code", value: record.portCode },
    { label: "Port Name", value: record.portName },
    { label: "Cost Category", value: record.costCategory },
    { label: "Benchmark Period", value: record.benchmarkPeriod },
    { label: "Benchmark Year", value: record.benchmarkYear?.toString() },
    { label: "Benchmark Month", value: record.benchmarkMonth?.toString() },
    { label: "Currency", value: record.currency },
    { label: "Average Cost", value: record.averageCost?.toLocaleString() },
    { label: "Median Cost", value: record.medianCost?.toLocaleString() },
    { label: "Minimum Cost", value: record.minimumCost?.toLocaleString() },
    { label: "Maximum Cost", value: record.maximumCost?.toLocaleString() },
    {
      label: "Standard Deviation",
      value: record.standardDeviation?.toLocaleString(),
    },
    { label: "Sample Size", value: record.sampleSize?.toString() },
    { label: "Percentile 25", value: record.percentile25?.toLocaleString() },
    { label: "Percentile 75", value: record.percentile75?.toLocaleString() },
    {
      label: "Industry Average",
      value: record.industryAverage?.toLocaleString(),
    },
    { label: "Our Average", value: record.ourAverage?.toLocaleString() },
    { label: "Cost Position", value: record.costPosition },
    { label: "Trend Direction", value: record.trendDirection },
    { label: "Trend Percent", value: record.trendPercent?.toLocaleString() },
    { label: "AI Model Version", value: record.aiModelVersion },
    { label: "Confidence Score", value: record.confidenceScore?.toLocaleString() },
    { label: "Data Source", value: record.dataSource },
    { label: "Notes", value: record.notes },
    {
      label: "Created At",
      value: record.createdAt
        ? new Date(record.createdAt).toLocaleString()
        : "--",
    },
    {
      label: "Updated At",
      value: record.updatedAt
        ? new Date(record.updatedAt).toLocaleString()
        : "--",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/cost-benchmarks"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.benchmarkRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.portName} &mdash; {record.costCategory}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              record.status === "published" ? "success" : "secondary"
            }
          >
            {record.status}
          </Badge>
          {canEdit && (
            <Link
              href={`/port-disbursement-accounting/cost-benchmarks/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-gray-500">{d.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {d.value ?? "--"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
