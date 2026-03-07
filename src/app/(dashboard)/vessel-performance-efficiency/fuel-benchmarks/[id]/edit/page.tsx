import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFuelBenchmark } from "@/lib/vessel-performance-efficiency/service";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditFuelBenchmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/fuel-benchmarks");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const FUEL_BENCHMARK_FIELDS: FieldConfig[] = [
    {
      name: "benchmarkType",
      label: "Benchmark Type",
      type: "select",
      required: true,
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "fleet", label: "Fleet" },
        { value: "class", label: "Class" },
        { value: "industry", label: "Industry" },
        { value: "historical", label: "Historical" },
      ],
    },
    { name: "vesselId", label: "Vessel ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "vesselClass", label: "Vessel Class", type: "text" },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    {
      name: "avgDailyConsumption",
      label: "Avg Daily Consumption",
      type: "text",
    },
    {
      name: "benchmarkConsumption",
      label: "Benchmark Consumption",
      type: "text",
    },
    { name: "efficiencyRatio", label: "Efficiency Ratio", type: "text" },
    { name: "fuelCostPerNm", label: "Fuel Cost Per NM", type: "text" },
    { name: "co2PerNm", label: "CO2 Per NM", type: "text" },
    { name: "fleetRanking", label: "Fleet Ranking", type: "number" },
    {
      name: "totalVesselsInClass",
      label: "Total Vessels In Class",
      type: "number",
    },
    { name: "percentile", label: "Percentile", type: "text" },
    { name: "trendDirection", label: "Trend Direction", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getFuelBenchmark(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/fuel-benchmarks/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Fuel Benchmark
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Fuel Benchmark"
          apiPath={`/api/v1/vessel-performance-efficiency/fuel-benchmarks/${id}`}
          fields={FUEL_BENCHMARK_FIELDS}
          initialData={{
            benchmarkType: record.benchmarkType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            vesselClass: record.vesselClass ?? "",
            periodStart: record.periodStart
              ? record.periodStart.toISOString()
              : "",
            periodEnd: record.periodEnd
              ? record.periodEnd.toISOString()
              : "",
            avgDailyConsumption: record.avgDailyConsumption ?? "",
            benchmarkConsumption: record.benchmarkConsumption ?? "",
            efficiencyRatio: record.efficiencyRatio ?? "",
            fuelCostPerNm: record.fuelCostPerNm ?? "",
            co2PerNm: record.co2PerNm ?? "",
            fleetRanking: record.fleetRanking ?? "",
            totalVesselsInClass: record.totalVesselsInClass ?? "",
            percentile: record.percentile ?? "",
            trendDirection: record.trendDirection ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/fuel-benchmarks/${id}`}
        />
      </div>
    </div>
  );
}
