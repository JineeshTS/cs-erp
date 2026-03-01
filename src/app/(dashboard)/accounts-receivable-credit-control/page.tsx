import Link from "next/link";
import {
  Plus,
  Users,
  Search,
  Shield,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  arccCustomerAccounts,
  arccCreditLimits,
  arccCashApplications,
  arccCollectionWorkflows,
  arccBadDebtProvisions,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AccountsReceivableCreditControlPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "receivable:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeAccounts, highRiskCredits, pendingApplications, openCollections, draftProvisions] =
    await Promise.all([
      db.select({ id: arccCustomerAccounts.id }).from(arccCustomerAccounts)
        .where(and(eq(arccCustomerAccounts.tenantId, session.tenantId), isNull(arccCustomerAccounts.deletedAt), eq(arccCustomerAccounts.accountStatus, "active")))
        .then((r) => r.length),
      db.select({ id: arccCreditLimits.id }).from(arccCreditLimits)
        .where(and(eq(arccCreditLimits.tenantId, session.tenantId), isNull(arccCreditLimits.deletedAt), eq(arccCreditLimits.riskCategory, "high")))
        .then((r) => r.length),
      db.select({ id: arccCashApplications.id }).from(arccCashApplications)
        .where(and(eq(arccCashApplications.tenantId, session.tenantId), isNull(arccCashApplications.deletedAt), eq(arccCashApplications.status, "pending")))
        .then((r) => r.length),
      db.select({ id: arccCollectionWorkflows.id }).from(arccCollectionWorkflows)
        .where(and(eq(arccCollectionWorkflows.tenantId, session.tenantId), isNull(arccCollectionWorkflows.deletedAt), eq(arccCollectionWorkflows.status, "open")))
        .then((r) => r.length),
      db.select({ id: arccBadDebtProvisions.id }).from(arccBadDebtProvisions)
        .where(and(eq(arccBadDebtProvisions.tenantId, session.tenantId), isNull(arccBadDebtProvisions.deletedAt), eq(arccBadDebtProvisions.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(arccCustomerAccounts.tenantId, session.tenantId),
    isNull(arccCustomerAccounts.deletedAt),
  ];
  if (status) conditions.push(eq(arccCustomerAccounts.accountStatus, status));
  if (search) {
    conditions.push(
      or(
        ilike(arccCustomerAccounts.customerName, `%${search}%`),
        ilike(arccCustomerAccounts.accountNumber, `%${search}%`),
        ilike(arccCustomerAccounts.customerCode ?? "", `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(arccCustomerAccounts.createdAt, new Date(cursor)));

  const data = await db.select().from(arccCustomerAccounts)
    .where(and(...conditions))
    .orderBy(desc(arccCustomerAccounts.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/accounts-receivable-credit-control?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable & Credit Control</h1>
          <p className="text-sm text-gray-500">Customer accounts, credit limits, collections, and cash management</p>
        </div>
        {canCreate && (
          <Link href="/accounts-receivable-credit-control/customer-accounts/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Account
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Accounts</p><p className="text-2xl font-bold text-gray-900">{activeAccounts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">High Risk Credits</p><p className="text-2xl font-bold text-gray-900">{highRiskCredits}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><CreditCard className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Cash Apps</p><p className="text-2xl font-bold text-gray-900">{pendingApplications}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Collections</p><p className="text-2xl font-bold text-gray-900">{openCollections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Provisions</p><p className="text-2xl font-bold text-gray-900">{draftProvisions}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Account number, customer name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/accounts-receivable-credit-control" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No customer accounts found.</p>
          {canCreate && (
            <Link href="/accounts-receivable-credit-control/customer-accounts/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first account</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Account #</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Segment</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Outstanding</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Overdue</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">On Hold</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/accounts-receivable-credit-control/customer-accounts/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.accountNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.segment ?? "--"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalOutstanding?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalOverdue?.toLocaleString()}</td>
                  <td className="px-4 py-3">{t.onHold ? <Badge variant="destructive">Hold</Badge> : <span className="text-gray-400">--</span>}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.accountStatus === "active" ? "success" : t.accountStatus === "suspended" ? "destructive" : "secondary"}>{t.accountStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
