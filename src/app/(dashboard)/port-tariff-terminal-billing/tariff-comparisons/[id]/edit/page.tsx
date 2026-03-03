import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTariffComparison } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

const COMPARISON_FIELDS: FieldConfig[] = [
  {
    name: "comparisonType",
    label: "Comparison Type",
    type: "select",
    required: true,
    options: [
      { value: "port_vs_port", label: "Port vs Port" },
      { value: "terminal_vs_terminal", label: "Terminal vs Terminal" },
      { value: "historical_trend", label: "Historical Trend" },
      { value: "regional_benchmark", label: "Regional Benchmark" },
      { value: "global_index", label: "Global Index" },
    ],
  },
  { name: "basePortCode", label: "Base Port Code", type: "text" },
  { name: "basePortName", label: "Base Port Name", type: "text" },
  { name: "comparePortCode", label: "Compare Port Code", type: "text" },
  { name: "comparePortName", label: "Compare Port Name", type: "text" },
  { name: "chargeCategory", label: "Charge Category", type: "text" },
  { name: "basePortCost", label: "Base Port Cost", type: "number" },
  { name: "comparePortCost", label: "Compare Port Cost", type: "number" },
  { name: "differenceAmount", label: "Difference Amount", type: "number" },
  { name: "differencePercentage", label: "Difference Percentage", type: "number" },
  { name: "benchmarkCurrency", label: "Benchmark Currency", type: "text" },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  { name: "recommendation", label: "Recommendation", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTariffComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getTariffComparison(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/tariff-comparisons/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Tariff Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Update tariff comparison details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Tariff Comparison"
          apiPath={`/api/v1/port-tariff-terminal-billing/tariff-comparisons/${id}`}
          returnPath={`/port-tariff-terminal-billing/tariff-comparisons/${id}`}
          fields={COMPARISON_FIELDS}
          initialData={{
            comparisonType: record.comparisonType ?? "",
            basePortCode: record.basePortCode ?? "",
            basePortName: record.basePortName ?? "",
            comparePortCode: record.comparePortCode ?? "",
            comparePortName: record.comparePortName ?? "",
            chargeCategory: record.chargeCategory ?? "",
            basePortCost: record.basePortCost ?? "",
            comparePortCost: record.comparePortCost ?? "",
            differenceAmount: record.differenceAmount ?? "",
            differencePercentage: record.differencePercentage ?? "",
            benchmarkCurrency: record.benchmarkCurrency ?? "",
            periodFrom: record.periodFrom
              ? new Date(record.periodFrom).toISOString()
              : "",
            periodTo: record.periodTo
              ? new Date(record.periodTo).toISOString()
              : "",
            recommendation: record.recommendation ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
