import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { exchangeRates } from "@/db/schema";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

const PAGE_SIZE = 50;

const columns: DataColumn[] = [
  { key: "baseCurrency", header: "From", width: "w-20" },
  { key: "targetCurrency", header: "To", width: "w-20" },
  { key: "rate", header: "Rate", width: "w-32" },
  { key: "source", header: "Source", width: "w-24" },
  { key: "effectiveDate", header: "Effective" },
  { key: "validUntil", header: "Valid Until", hideOnMobile: true },
  { key: "status", header: "Status", width: "w-24" },
];

export default async function ExchangeRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cursor?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(session.id, session.tenantId, "masterdata:create");
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const cursor = parseCompoundCursor(params.cursor);

  const conditions = and(
    eq(exchangeRates.tenantId, session.tenantId),
    isNull(exchangeRates.deletedAt),
    q ? or(ilike(exchangeRates.baseCurrency, `%${q}%`), ilike(exchangeRates.targetCurrency, `%${q}%`)) : undefined,
    cursor ? cursorCondition(exchangeRates.createdAt, exchangeRates.id, cursor) : undefined,
  );

  const rows = await db
    .select()
    .from(exchangeRates)
    .where(conditions)
    .orderBy(desc(exchangeRates.createdAt), desc(exchangeRates.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const data = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore && data.length > 0
    ? encodeCompoundCursor(data[data.length - 1].createdAt!, String(data[data.length - 1].id))
    : null;

  const loadMoreUrl = nextCursor
    ? `/master-data-management/exchange-rates?${new URLSearchParams({
        ...(q && { q }),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">Exchange Rates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Currency exchange rate management ({data.length}{hasMore ? "+" : ""} records)</p>
        </div>
        {canCreate && (
          <Link href="/master-data-management/exchange-rates/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Add Rate
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input type="text" name="q" defaultValue={q} placeholder="Search by currency code (USD, QAR...)..."
          className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        <button type="submit" className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300">Search</button>
        {q && <Link href="/master-data-management/exchange-rates" className="text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400">Clear</Link>}
      </form>

      <DataTable
        columns={columns}
        data={data as Record<string, unknown>[]}
        rowLink={(row) => `/master-data-management/exchange-rates/${row.id}`}
        emptyMessage="No exchange rates found"
        emptyAction={canCreate ? { label: "Add Rate", href: "/master-data-management/exchange-rates/new" } : undefined}
      />

      {loadMoreUrl && (
        <div className="text-center">
          <Link
            href={loadMoreUrl}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
