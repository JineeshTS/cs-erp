import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmRateBenchmarks } from "@/db/schema";
import { CpmForm, type FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

export default async function EditRateBenchmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmRateBenchmarks)
    .where(
      and(
        eq(cpmRateBenchmarks.id, id),
        eq(cpmRateBenchmarks.tenantId, session.tenantId),
        isNull(cpmRateBenchmarks.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  const fields: FieldConfig[] = [
    { name: "benchmarkName", label: "Benchmark Name", type: "text", required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
    { name: "originPort", label: "Origin Port", type: "text" },
    { name: "destinationPort", label: "Destination Port", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "marketRate", label: "Market Rate", type: "number", required: true },
    { name: "ourRate", label: "Our Rate", type: "number" },
    { name: "competitorRate", label: "Competitor Rate", type: "number" },
    { name: "competitorName", label: "Competitor Name", type: "text" },
    { name: "benchmarkSource", label: "Benchmark Source", type: "text" },
    { name: "benchmarkDate", label: "Benchmark Date", type: "date", required: true },
    { name: "currency", label: "Currency", type: "text" },
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

  const defaultValues: Record<string, string | number | undefined> = {
    benchmarkName: record.benchmarkName,
    tradeLane: record.tradeLane,
    originPort: record.originPort ?? undefined,
    destinationPort: record.destinationPort ?? undefined,
    containerType: record.containerType ?? undefined,
    containerSize: record.containerSize ?? undefined,
    marketRate: record.marketRate != null ? Number(record.marketRate) : undefined,
    ourRate: record.ourRate != null ? Number(record.ourRate) : undefined,
    competitorRate: record.competitorRate != null ? Number(record.competitorRate) : undefined,
    competitorName: record.competitorName ?? undefined,
    benchmarkSource: record.benchmarkSource ?? undefined,
    benchmarkDate: record.benchmarkDate
      ? new Date(record.benchmarkDate).toISOString().slice(0, 10)
      : undefined,
    currency: record.currency ?? undefined,
    variancePercent: record.variancePercent != null ? Number(record.variancePercent) : undefined,
    trend: record.trend ?? undefined,
    notes: record.notes ?? undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/rate-benchmarks/${record.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Rate Benchmark</h1>
      </div>

      <CpmForm
        entityType="Rate Benchmark"
        fields={fields}
        apiPath={`/api/v1/commercial-pricing-management/rate-benchmarks/${record.id}`}
        returnPath="/commercial-pricing-management/rate-benchmarks"
        initialData={defaultValues}
        isEdit
      />
    </div>
  );
}
