import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Calculator,
  Clock,
  Receipt,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  ddmDemurrageCalculations,
  ddmDetentionTrackings,
  ddmInvoices,
  ddmDisputes,
  ddmPredictions,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function DemurrageDetentionManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "demurrage:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [pendingDemurrage, activeDetentions, unpaidInvoices, openDisputes, highRiskPredictions] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ddmDemurrageCalculations)
        .where(and(eq(ddmDemurrageCalculations.tenantId, session.tenantId), isNull(ddmDemurrageCalculations.deletedAt), eq(ddmDemurrageCalculations.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ddmDetentionTrackings)
        .where(and(eq(ddmDetentionTrackings.tenantId, session.tenantId), isNull(ddmDetentionTrackings.deletedAt), eq(ddmDetentionTrackings.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ddmInvoices)
        .where(and(eq(ddmInvoices.tenantId, session.tenantId), isNull(ddmInvoices.deletedAt), eq(ddmInvoices.status, "sent")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ddmDisputes)
        .where(and(eq(ddmDisputes.tenantId, session.tenantId), isNull(ddmDisputes.deletedAt), eq(ddmDisputes.status, "open")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ddmPredictions)
        .where(and(eq(ddmPredictions.tenantId, session.tenantId), isNull(ddmPredictions.deletedAt), eq(ddmPredictions.riskLevel, "high")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(ddmDemurrageCalculations.tenantId, session.tenantId),
    isNull(ddmDemurrageCalculations.deletedAt),
  ];
  if (status) conditions.push(eq(ddmDemurrageCalculations.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ddmDemurrageCalculations.calculationRef, `%${escapeIlike(search)}%`),
        ilike(ddmDemurrageCalculations.containerNumber, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(ddmDemurrageCalculations.createdAt, ddmDemurrageCalculations.id, parsedCursor));

  const data = await db.select().from(ddmDemurrageCalculations)
    .where(and(...conditions))
    .orderBy(desc(ddmDemurrageCalculations.createdAt), desc(ddmDemurrageCalculations.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/demurrage-detention-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demurrage & Detention Management</h1>
          <p className="text-sm text-gray-500">Demurrage calculations, detention tracking, invoices, disputes, waivers, predictions, and notifications</p>
        </div>
        {canCreate && (
          <Link href="/demurrage-detention-management/demurrage-calculations/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Calculation
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Calculator className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Demurrage</p><p className="text-2xl font-bold text-gray-900">{pendingDemurrage}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Clock className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Detentions</p><p className="text-2xl font-bold text-gray-900">{activeDetentions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Receipt className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Unpaid Invoices</p><p className="text-2xl font-bold text-gray-900">{unpaidInvoices}</p></div>
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
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">High Risk Predictions</p><p className="text-2xl font-bold text-gray-900">{highRiskPredictions}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Calculation ref, container number..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="calculated">Calculated</option>
            <option value="invoiced">Invoiced</option>
            <option value="disputed">Disputed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/demurrage-detention-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No demurrage calculations found.</p>
          {canCreate && (
            <Link href="/demurrage-detention-management/demurrage-calculations/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first calculation</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Total Amount</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/demurrage-detention-management/demurrage-calculations/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.calculationRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.containerNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalAmount ? `${t.currency ?? "USD"} ${t.totalAmount}` : "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "calculated" ? "success" : t.status === "closed" ? "destructive" : "secondary"}>{t.status}</Badge>
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
