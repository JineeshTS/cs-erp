import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCostBenchmark } from "@/lib/port-disbursement-accounting/service";
import { PdaForm } from "@/components/port-disbursement-accounting/pda-form";
import type { FieldConfig } from "@/components/port-disbursement-accounting/pda-form";

const FIELDS: FieldConfig[] = [
  { name: "portCode", label: "Port Code", type: "text", required: true },
  { name: "portName", label: "Port Name", type: "text", required: true },
  {
    name: "costCategory",
    label: "Cost Category",
    type: "select",
    required: true,
    options: [
      { value: "port_dues", label: "Port Dues" },
      { value: "pilotage", label: "Pilotage" },
      { value: "towage", label: "Towage" },
      { value: "berth_hire", label: "Berth Hire" },
      { value: "cargo_handling", label: "Cargo Handling" },
      { value: "agency_fees", label: "Agency Fees" },
      { value: "customs", label: "Customs" },
      { value: "quarantine", label: "Quarantine" },
      { value: "anchorage", label: "Anchorage" },
      { value: "total", label: "Total" },
    ],
  },
  {
    name: "benchmarkPeriod",
    label: "Benchmark Period",
    type: "text",
    required: true,
  },
  {
    name: "benchmarkYear",
    label: "Benchmark Year",
    type: "number",
    required: true,
  },
  {
    name: "benchmarkMonth",
    label: "Benchmark Month",
    type: "number",
    required: true,
  },
  { name: "currency", label: "Currency", type: "text" },
  {
    name: "averageCost",
    label: "Average Cost",
    type: "number",
    required: true,
  },
  { name: "medianCost", label: "Median Cost", type: "number" },
  { name: "minimumCost", label: "Minimum Cost", type: "number" },
  { name: "maximumCost", label: "Maximum Cost", type: "number" },
  { name: "sampleSize", label: "Sample Size", type: "number" },
  { name: "aiModelVersion", label: "AI Model Version", type: "text" },
  { name: "dataSource", label: "Data Source", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCostBenchmarkPage({
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
      "disbursement:edit"
    ))
  )
    redirect("/port-disbursement-accounting/cost-benchmarks");

  const { id } = await params;
  const record = await getCostBenchmark(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    portCode: record.portCode,
    portName: record.portName,
    costCategory: record.costCategory,
    benchmarkPeriod: record.benchmarkPeriod,
    benchmarkYear: record.benchmarkYear,
    benchmarkMonth: record.benchmarkMonth,
    currency: record.currency ?? "",
    averageCost: record.averageCost,
    medianCost: record.medianCost ?? "",
    minimumCost: record.minimumCost ?? "",
    maximumCost: record.maximumCost ?? "",
    sampleSize: record.sampleSize ?? "",
    aiModelVersion: record.aiModelVersion ?? "",
    dataSource: record.dataSource ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/cost-benchmarks/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cost Benchmark
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Cost Benchmark"
          apiPath={`/api/v1/port-disbursement-accounting/cost-benchmarks/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/port-disbursement-accounting/cost-benchmarks/${id}`}
        />
      </div>
    </div>
  );
}
