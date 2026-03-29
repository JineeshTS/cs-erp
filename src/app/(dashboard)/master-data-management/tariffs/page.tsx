import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { tariffCodes } from "@/db/schema";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

const PAGE_SIZE = 50;

const columns: DataColumn[] = [
  { key: "code", header: "Tariff Code", width: "w-28" },
  { key: "description", header: "Description" },
  { key: "rateType", header: "Rate Type", width: "w-28" },
  { key: "rateAmount", header: "Rate", width: "w-24", render: (v) => v ? `$${Number(v).toLocaleString()}` : "—" },
  { key: "currency", header: "Currency", width: "w-20" },
  { key: "status", header: "Status", width: "w-24" },
];

export default async function TariffsPage({
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
    eq(tariffCodes.tenantId, session.tenantId),
    isNull(tariffCodes.deletedAt),
    q ? or(ilike(tariffCodes.code, `%${q}%`), ilike(tariffCodes.description, `%${q}%`)) : undefined,
    cursor ? cursorCondition(tariffCodes.createdAt, tariffCodes.id, cursor) : undefined,
  );

  const rows = await db
    .select()
    .from(tariffCodes)
    .where(conditions)
    .orderBy(desc(tariffCodes.createdAt), desc(tariffCodes.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const data = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore && data.length > 0
    ? encodeCompoundCursor(data[data.length - 1].createdAt!, String(data[data.length - 1].id))
    : null;

  const loadMoreUrl = nextCursor
    ? `/master-data-management/tariffs?${new URLSearchParams({
        ...(q && { q }),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">Tariff Codes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Freight tariff and rate management ({data.length}{hasMore ? "+" : ""} records)</p>
        </div>
        {canCreate && (
          <Link href="/master-data-management/tariffs/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Add Tariff
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input type="text" name="q" defaultValue={q} placeholder="Search by tariff code or description..."
          className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        <button type="submit" className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300">Search</button>
        {q && <Link href="/master-data-management/tariffs" className="text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400">Clear</Link>}
      </form>

      <DataTable
        columns={columns}
        data={data as Record<string, unknown>[]}
        rowLink={(row) => `/master-data-management/tariffs/${row.id}`}
        emptyMessage="No tariff codes found"
        emptyAction={canCreate ? { label: "Add Tariff", href: "/master-data-management/tariffs/new" } : undefined}
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
