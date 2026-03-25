import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { customers } from "@/db/schema";
import { DataTable, type DataColumn } from "@/components/ui/data-table";

const columns: DataColumn[] = [
  { key: "name", header: "Customer Name", width: "w-48" },
  { key: "shortName", header: "Short Name", width: "w-28" },
  { key: "customerType", header: "Type", width: "w-28" },
  { key: "country", header: "Country", width: "w-24" },
  { key: "creditLimitAmount", header: "Credit Limit", width: "w-28",
    render: (v) => v ? `$${Number(v).toLocaleString()}` : "—" },
  { key: "status", header: "Status", width: "w-24" },
];

export default async function CustomersListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
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
    .from(customers)
    .where(and(
      eq(customers.tenantId, session.tenantId),
      isNull(customers.deletedAt),
      q ? or(ilike(customers.name, `%${q}%`), ilike(customers.shortName, `%${q}%`), ilike(customers.country, `%${q}%`)) : undefined,
      statusFilter ? eq(customers.status, statusFilter) : undefined,
    ))
    .orderBy(desc(customers.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">Customers</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Customer master data and agent hierarchy ({data.length} records)</p>
        </div>
        {canCreate && (
          <Link href="/master-data-management/customers/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Add Customer
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input type="text" name="q" defaultValue={q} placeholder="Search by name, short name, or country..."
          className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        <select name="status" defaultValue={statusFilter}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
          <option value="blocked">Blocked</option>
        </select>
        <button type="submit" className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300">Search</button>
        {(q || statusFilter) && <Link href="/master-data-management/customers" className="text-sm text-slate-500 hover:text-slate-700">Clear</Link>}
      </form>

      <DataTable
        columns={columns}
        data={data as Record<string, unknown>[]}
        rowLink={(row) => `/master-data-management/customers/${row.id}`}
        emptyMessage={q ? `No customers matching "${q}"` : "No customers found"}
        emptyAction={canCreate ? { label: "Add Customer", href: "/master-data-management/customers/new" } : undefined}
      />
    </div>
  );
}
