import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  CreditCard,
  AlertTriangle,
  Bell,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  firmFreightInvoices,
  firmDebitCreditNotes,
  firmInvoiceDisputes,
  firmDunningRuns,
  firmRevenueForecastEntries,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function FreightInvoiceRevenueManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "invoice:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftInvoices, pendingNotes, openDisputes, activeDunning, draftForecasts] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(firmFreightInvoices)
        .where(and(eq(firmFreightInvoices.tenantId, session.tenantId), isNull(firmFreightInvoices.deletedAt), eq(firmFreightInvoices.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(firmDebitCreditNotes)
        .where(and(eq(firmDebitCreditNotes.tenantId, session.tenantId), isNull(firmDebitCreditNotes.deletedAt), eq(firmDebitCreditNotes.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(firmInvoiceDisputes)
        .where(and(eq(firmInvoiceDisputes.tenantId, session.tenantId), isNull(firmInvoiceDisputes.deletedAt), eq(firmInvoiceDisputes.status, "open")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(firmDunningRuns)
        .where(and(eq(firmDunningRuns.tenantId, session.tenantId), isNull(firmDunningRuns.deletedAt), eq(firmDunningRuns.status, "running")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(firmRevenueForecastEntries)
        .where(and(eq(firmRevenueForecastEntries.tenantId, session.tenantId), isNull(firmRevenueForecastEntries.deletedAt), eq(firmRevenueForecastEntries.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(firmFreightInvoices.tenantId, session.tenantId),
    isNull(firmFreightInvoices.deletedAt),
  ];
  if (status) conditions.push(eq(firmFreightInvoices.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(firmFreightInvoices.invoiceNumber, `%${escapeIlike(search)}%`),
        ilike(firmFreightInvoices.customerName, `%${escapeIlike(search)}%`),
        ilike(firmFreightInvoices.blNumber ?? "", `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(firmFreightInvoices.createdAt, firmFreightInvoices.id, parsedCursor));

  const data = await db.select().from(firmFreightInvoices)
    .where(and(...conditions))
    .orderBy(desc(firmFreightInvoices.createdAt), desc(firmFreightInvoices.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/freight-invoice-revenue-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Freight Invoice & Revenue Management</h1>
          <p className="text-sm text-gray-500">Invoicing, credit/debit notes, disputes, dunning, and revenue forecasting</p>
        </div>
        {canCreate && (
          <Link href="/freight-invoice-revenue-management/freight-invoices/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Invoice
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><FileText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Invoices</p><p className="text-2xl font-bold text-gray-900">{draftInvoices}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><CreditCard className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Notes</p><p className="text-2xl font-bold text-gray-900">{pendingNotes}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Disputes</p><p className="text-2xl font-bold text-gray-900">{openDisputes}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Bell className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Dunning</p><p className="text-2xl font-bold text-gray-900">{activeDunning}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Forecasts</p><p className="text-2xl font-bold text-gray-900">{draftForecasts}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Invoice number, customer, or B/L..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="dispatched">Dispatched</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/freight-invoice-revenue-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No freight invoices found.</p>
          {canCreate && (
            <Link href="/freight-invoice-revenue-management/freight-invoices/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first invoice</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Invoice #</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Outstanding</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Due Date</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/freight-invoice-revenue-management/freight-invoices/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.invoiceNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.invoiceType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.outstandingAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "paid" ? "success" : t.status === "overdue" ? "destructive" : t.status === "cancelled" ? "destructive" : "secondary"}>{t.status}</Badge>
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
