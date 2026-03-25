import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { ports } from "@/db/schema";
import { DataTable, type DataColumn } from "@/components/ui/data-table";

const columns: DataColumn[] = [
  { key: "name", header: "Port Name", width: "w-48" },
  { key: "unLocode", header: "UN/LOCODE", width: "w-28" },
  { key: "country", header: "Country", width: "w-32" },
  { key: "portType", header: "Type", width: "w-28" },
  { key: "status", header: "Status", width: "w-24" },
  { key: "timeZone", header: "Timezone", hideOnMobile: true },
];

export default async function PortsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; cursor?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(session.id, session.tenantId, "masterdata:create");
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const statusFilter = params.status || "";

  const data = await db
    .select()
    .from(ports)
    .where(and(
      eq(ports.tenantId, session.tenantId),
      isNull(ports.deletedAt),
      q ? or(ilike(ports.name, `%${q}%`), ilike(ports.unLocode, `%${q}%`), ilike(ports.country, `%${q}%`)) : undefined,
      statusFilter ? eq(ports.status, statusFilter) : undefined,
    ))
    .orderBy(desc(ports.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">
            Ports & Terminals
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Manage port and terminal master data ({data.length} records)
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/ports/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add Port
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, LOCODE, or country..."
          className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300"
        >
          Search
        </button>
        {(q || statusFilter) && (
          <Link
            href="/master-data-management/ports"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400"
          >
            Clear
          </Link>
        )}
      </form>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data as Record<string, unknown>[]}
        rowLink={(row) => `/master-data-management/ports/${row.id}`}
        emptyMessage={q ? `No ports matching "${q}"` : "No ports found"}
        emptyAction={canCreate ? { label: "Add Port", href: "/master-data-management/ports/new" } : undefined}
      />
    </div>
  );
}
