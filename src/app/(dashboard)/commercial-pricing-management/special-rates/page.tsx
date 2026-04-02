import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import { Plus, ArrowLeft, ArrowRight, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmSpecialRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
const PAGE_SIZE = 50;

const statusVariant: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-yellow-100 text-yellow-700",
};

export default async function SpecialRatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const conditions = [
    eq(cpmSpecialRates.tenantId, session.tenantId),
    isNull(cpmSpecialRates.deletedAt),
  ];

  if (search) {
    conditions.push(ilike(cpmSpecialRates.rateName, `%${escapeIlike(search)}%`));
  }

  if (status) {
    conditions.push(eq(cpmSpecialRates.status, status));
  }

  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(cpmSpecialRates.createdAt, cpmSpecialRates.id, parsedCursor));
    }

  const rows = await db
    .select()
    .from(cpmSpecialRates)
    .where(and(...conditions))
    .orderBy(desc(cpmSpecialRates.createdAt), desc(cpmSpecialRates.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildQs(extra: Record<string, string>) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Special Rates</h1>
        </div>
        <Link
          href="/commercial-pricing-management/special-rates/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Special Rate
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by rate name..."
            className="w-full rounded-md border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16">
          <FileText className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No special rates found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || status
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating a new special rate."}
          </p>
          {!search && !status && (
            <Link
              href="/commercial-pricing-management/special-rates/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Special Rate
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Base Rate</th>
                <th className="px-4 py-3 font-medium text-right">Final Rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/commercial-pricing-management/special-rates/${item.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.rateCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.rateName}</td>
                  <td className="px-4 py-3 capitalize">
                    {item.rateType?.replace(/_/g, " ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.baseRate != null
                      ? Number(item.baseRate).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.finalRate != null
                      ? Number(item.finalRate).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.status ? (
                      <Badge
                        className={
                          statusVariant[item.status] ?? "bg-gray-100 text-gray-700"
                        }
                      >
                        {item.status}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {items.length} record{items.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          {cursor && (
            <Link
              href={`/commercial-pricing-management/special-rates${buildQs({})}`}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              First Page
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/commercial-pricing-management/special-rates${buildQs({ cursor: nextCursor })}`}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
