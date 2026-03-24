import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNull, lt } from "drizzle-orm";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmYieldTargets } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function YieldTargetsListPage({
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
    eq(cpmYieldTargets.tenantId, session.tenantId),
    isNull(cpmYieldTargets.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmYieldTargets.targetName, `%${escapeIlike(search)}%`));
  }

  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmYieldTargets.createdAt, cpmYieldTargets.id, parsedCursor));
    }

  const records = await db
    .select()
    .from(cpmYieldTargets)
    .where(and(...conditions))
    .orderBy(desc(cpmYieldTargets.createdAt), desc(cpmYieldTargets.id))
    .limit(limit + 1);

  const hasMore = records.length > limit;
  const items = hasMore ? records.slice(0, limit) : records;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "achieved":
        return "secondary";
      case "missed":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "outline";
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
          <h1 className="text-2xl font-semibold">Yield Targets</h1>
        </div>
        <Link
          href="/commercial-pricing-management/yield-targets/new"
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
            placeholder="Search by target name..."
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target Rev/TEU</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilization %</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No yield target records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/commercial-pricing-management/yield-targets/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.targetName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.tradeLane}</td>
                    <td className="px-4 py-3">{item.fiscalYear}</td>
                    <td className="px-4 py-3">{item.targetRevenuePerTeu}</td>
                    <td className="px-4 py-3">{item.targetUtilizationPercent != null ? `${item.targetUtilizationPercent}%` : "--"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColor(item.status)}>{item.status}</Badge>
                    </td>
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
            href={`/commercial-pricing-management/yield-targets?cursor=${encodeURIComponent(nextCursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
