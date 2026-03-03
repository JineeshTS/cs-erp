import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  BookOpen,
  ScrollText,
  CalendarOff,
  FileBarChart,
  PieChart,
  Building2,
  Wallet,
  GitCompare,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  glfrChartOfAccounts,
  glfrJournalEntries,
  glfrPeriodClosures,
  glfrFinancialStatements,
  glfrSegmentReports,
  glfrConsolidatedStatements,
  glfrBudgets,
  glfrVarianceAnalyses,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function GeneralLedgerFinancialReportingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "gl:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeAccounts, draftJournalEntries, openPeriods, draftStatements, draftSegmentReports, draftConsolidations, draftBudgets, draftVarianceAnalyses] =
    await Promise.all([
      db.select({ id: glfrChartOfAccounts.id }).from(glfrChartOfAccounts)
        .where(and(eq(glfrChartOfAccounts.tenantId, session.tenantId), isNull(glfrChartOfAccounts.deletedAt), eq(glfrChartOfAccounts.status, "active")))
        .then((r) => r.length),
      db.select({ id: glfrJournalEntries.id }).from(glfrJournalEntries)
        .where(and(eq(glfrJournalEntries.tenantId, session.tenantId), isNull(glfrJournalEntries.deletedAt), eq(glfrJournalEntries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrPeriodClosures.id }).from(glfrPeriodClosures)
        .where(and(eq(glfrPeriodClosures.tenantId, session.tenantId), isNull(glfrPeriodClosures.deletedAt), eq(glfrPeriodClosures.status, "open")))
        .then((r) => r.length),
      db.select({ id: glfrFinancialStatements.id }).from(glfrFinancialStatements)
        .where(and(eq(glfrFinancialStatements.tenantId, session.tenantId), isNull(glfrFinancialStatements.deletedAt), eq(glfrFinancialStatements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrSegmentReports.id }).from(glfrSegmentReports)
        .where(and(eq(glfrSegmentReports.tenantId, session.tenantId), isNull(glfrSegmentReports.deletedAt), eq(glfrSegmentReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrConsolidatedStatements.id }).from(glfrConsolidatedStatements)
        .where(and(eq(glfrConsolidatedStatements.tenantId, session.tenantId), isNull(glfrConsolidatedStatements.deletedAt), eq(glfrConsolidatedStatements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrBudgets.id }).from(glfrBudgets)
        .where(and(eq(glfrBudgets.tenantId, session.tenantId), isNull(glfrBudgets.deletedAt), eq(glfrBudgets.status, "draft")))
        .then((r) => r.length),
      db.select({ id: glfrVarianceAnalyses.id }).from(glfrVarianceAnalyses)
        .where(and(eq(glfrVarianceAnalyses.tenantId, session.tenantId), isNull(glfrVarianceAnalyses.deletedAt), eq(glfrVarianceAnalyses.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(glfrChartOfAccounts.tenantId, session.tenantId),
    isNull(glfrChartOfAccounts.deletedAt),
  ];
  if (status) conditions.push(eq(glfrChartOfAccounts.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(glfrChartOfAccounts.accountCode, `%${search}%`),
        ilike(glfrChartOfAccounts.accountName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(glfrChartOfAccounts.createdAt, new Date(cursor)));

  const data = await db.select().from(glfrChartOfAccounts)
    .where(and(...conditions))
    .orderBy(desc(glfrChartOfAccounts.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/general-ledger-financial-reporting?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Ledger & Financial Reporting</h1>
          <p className="text-sm text-gray-500">Chart of accounts, journal entries, period closures, financial statements, segment reports, consolidations, budgets, and variance analyses</p>
        </div>
        {canCreate && (
          <Link href="/general-ledger-financial-reporting/chart-of-accounts/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Account
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Accounts</p><p className="text-2xl font-bold text-gray-900">{activeAccounts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><ScrollText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Journal Entries</p><p className="text-2xl font-bold text-gray-900">{draftJournalEntries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><CalendarOff className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Periods</p><p className="text-2xl font-bold text-gray-900">{openPeriods}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><FileBarChart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Statements</p><p className="text-2xl font-bold text-gray-900">{draftStatements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><PieChart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Segment Reports</p><p className="text-2xl font-bold text-gray-900">{draftSegmentReports}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Consolidations</p><p className="text-2xl font-bold text-gray-900">{draftConsolidations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Wallet className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Budgets</p><p className="text-2xl font-bold text-gray-900">{draftBudgets}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><GitCompare className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Variance Analyses</p><p className="text-2xl font-bold text-gray-900">{draftVarianceAnalyses}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Account code, name..."
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
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/general-ledger-financial-reporting" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No chart of accounts found.</p>
          {canCreate && (
            <Link href="/general-ledger-financial-reporting/chart-of-accounts/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Add your first account</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Normal Balance</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Current Balance</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/general-ledger-financial-reporting/chart-of-accounts/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.accountCode}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.accountName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.accountType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.normalBalance || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.currentBalance ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "suspended" ? "destructive" : "secondary"}>{t.status}</Badge>
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
