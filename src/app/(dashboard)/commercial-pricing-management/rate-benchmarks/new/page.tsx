import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm, type FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewRateBenchmarkPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const fields: FieldConfig[] = [
    { name: "benchmarkName", label: "Benchmark Name", type: "text", required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "marketRate", label: "Market Rate", type: "number", required: true },
    { name: "ourRate", label: "Our Rate", type: "number" },
    { name: "competitorRate", label: "Competitor Rate", type: "number" },
    { name: "competitorName", label: "Competitor Name", type: "text" },
    { name: "benchmarkSource", label: "Benchmark Source", type: "text" },
    { name: "benchmarkDate", label: "Benchmark Date", type: "date", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "variancePercent", label: "Variance %", type: "number" },
    {
      name: "trend",
      label: "Trend",
      type: "select",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
        { label: "Stable", value: "stable" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/rate-benchmarks"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Rate Benchmark</h1>
      </div>

      <CpmForm
        entityType="Rate Benchmark"
        fields={fields}
        apiPath="/api/v1/commercial-pricing-management/rate-benchmarks"
        returnPath="/commercial-pricing-management/rate-benchmarks"
      />
    </div>
  );
}
