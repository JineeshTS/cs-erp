import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewFuelBenchmarkPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "vpe:create"))
  )
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/fuel-benchmarks"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Fuel Benchmark
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Fuel Benchmark"
          apiPath="/api/v1/vessel-performance-efficiency/fuel-benchmarks"
          fields={FUEL_BENCHMARK_FIELDS}
          returnPath="/vessel-performance-efficiency/fuel-benchmarks"
        />
      </div>
    </div>
  );
}
