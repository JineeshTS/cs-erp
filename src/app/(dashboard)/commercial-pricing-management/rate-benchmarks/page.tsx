import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNull, lt } from "drizzle-orm";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmRateBenchmarks } from "@/db/schema";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function RateBenchmarksListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { search, cursor } = await searchParams;
  const limit = 50;

  const conditions = [
    eq(cpmRateBenchmarks.tenantId, session.tenantId),
    isNull(cpmRateBenchmarks.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmRateBenchmarks.benchmarkName, `%${escapeIlike(search)}%`));
  }

  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmRateBenchmarks.createdAt, cpmRateBenchmarks.id, parsedCursor));
    }

  const records = await db
    .select()
    .from(cpmRateBenchmarks)
    .where(and(...conditions))
    .orderBy(desc(cpmRateBenchmarks.createdAt), desc(cpmRateBenchmarks.id))
    .limit(limit + 1);

  const hasMore = records.length > limit;
  const items = hasMore ? records.slice(0, limit) : records;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  const trendIcon = (trend: string | null) => {
    switch (trend) {
      case "up":
        return "Up";
      case "down":
        return "Down";
      case "stable":
        return "Stable";
      default:
        return "--";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">Rate Benchmarks</h1>
        </div>
        <Link
          href="/commercial-pricing-management/rate-benchmarks/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </div>

      <form className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Search by benchmark name..."
            defaultValue={search ?? ""}
            className="h-10 w-full rounded-md border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trade Lane</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Market Rate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Our Rate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Variance %</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No rate benchmark records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/commercial-pricing-management/rate-benchmarks/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.benchmarkName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.tradeLane}</td>
                    <td className="px-4 py-3">{item.marketRate}</td>
                    <td className="px-4 py-3">{item.ourRate ?? "--"}</td>
                    <td className="px-4 py-3">{item.variancePercent != null ? `${item.variancePercent}%` : "--"}</td>
                    <td className="px-4 py-3 capitalize">{trendIcon(item.trend)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <Link
            href={`/commercial-pricing-management/rate-benchmarks?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
