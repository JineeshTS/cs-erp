import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmRateBenchmarks } from "@/db/schema";

export default async function RateBenchmarkDetailPage({
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

  const details = [
    { label: "Benchmark Name", value: record.benchmarkName },
    { label: "Trade Lane", value: record.tradeLane },
    { label: "Origin Port", value: record.originPort },
    { label: "Destination Port", value: record.destinationPort },
    { label: "Container Type", value: record.containerType },
    { label: "Container Size", value: record.containerSize },
    { label: "Market Rate", value: record.marketRate },
    { label: "Our Rate", value: record.ourRate },
    { label: "Competitor Rate", value: record.competitorRate },
    { label: "Competitor Name", value: record.competitorName },
    { label: "Benchmark Source", value: record.benchmarkSource },
    { label: "Benchmark Date", value: record.benchmarkDate ? new Date(record.benchmarkDate).toLocaleDateString() : null },
    { label: "Currency", value: record.currency },
    { label: "Variance %", value: record.variancePercent != null ? `${record.variancePercent}%` : null },
    { label: "Trend", value: record.trend },
    { label: "Notes", value: record.notes },
    { label: "Created At", value: record.createdAt.toLocaleString() },
    { label: "Updated At", value: record.updatedAt.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/rate-benchmarks"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{record.benchmarkName}</h1>
        </div>
        <Link
          href={`/commercial-pricing-management/rate-benchmarks/${record.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-sm capitalize">{detail.value ?? <span className="text-muted-foreground italic">--</span>}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
