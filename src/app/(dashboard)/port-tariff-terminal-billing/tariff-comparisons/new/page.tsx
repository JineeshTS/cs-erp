import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewTariffComparisonPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/port-tariff-terminal-billing/tariff-comparisons"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Tariff Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new port tariff comparison
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Tariff Comparison"
          apiPath="/api/v1/port-tariff-terminal-billing/tariff-comparisons"
          returnPath="/port-tariff-terminal-billing/tariff-comparisons"
          fields={COMPARISON_FIELDS}
        />
      </div>
    </div>
  );
}
