import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { glAccounts } from "@/db/schema";
import { DataTable, type DataColumn } from "@/components/ui/data-table";

const columns: DataColumn[] = [
  { key: "accountCode", header: "Account Code", width: "w-28" },
  { key: "name", header: "Account Name" },
  { key: "accountType", header: "Type", width: "w-28" },
  { key: "currency", header: "Currency", width: "w-20" },
  { key: "status", header: "Status", width: "w-24" },
];

export default async function GlAccountsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read"))) redirect("/master-data-management");
  const canCreate = await hasPermission(session.id, session.tenantId, "masterdata:create");
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const data = await db.select().from(glAccounts).where(and(eq(glAccounts.tenantId, session.tenantId), isNull(glAccounts.deletedAt), q ? or(ilike(glAccounts.accountCode, `%${q}%`), ilike(glAccounts.name, `%${q}%`)) : undefined)).orderBy(desc(glAccounts.createdAt)).limit(50);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">GL Accounts</h1><p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Chart of accounts ({data.length} records)</p></div>
        {canCreate && <Link href="/master-data-management/gl-accounts/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"><Plus className="h-4 w-4" /> Add Account</Link>}
      </div>
      <form className="flex flex-wrap items-center gap-3">
        <input type="text" name="q" defaultValue={q} placeholder="Search by code or name..." className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        <button type="submit" className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300">Search</button>
        {q && <Link href="/master-data-management/gl-accounts" className="text-sm text-slate-500 hover:text-slate-700">Clear</Link>}
      </form>
      <DataTable columns={columns} data={data as Record<string, unknown>[]} rowLink={(row) => `/master-data-management/gl-accounts/${row.id}`} emptyMessage="No GL accounts found" emptyAction={canCreate ? { label: "Add Account", href: "/master-data-management/gl-accounts/new" } : undefined} />
    </div>
  );
}
