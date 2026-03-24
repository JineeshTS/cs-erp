import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  CheckCircle,
  DollarSign,
  ClipboardList,
  Layers,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  pdaProformaEstimates,
  pdaFinalDas,
  pdaPortCosts,
  pdaAgentStatements,
  pdaExpenseAllocations,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function PortDisbursementAccountingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "disbursement:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftProformas, pendingFinals, activeCosts, openStatements, pendingAllocations] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(pdaProformaEstimates)
        .where(and(eq(pdaProformaEstimates.tenantId, session.tenantId), isNull(pdaProformaEstimates.deletedAt), eq(pdaProformaEstimates.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(pdaFinalDas)
        .where(and(eq(pdaFinalDas.tenantId, session.tenantId), isNull(pdaFinalDas.deletedAt), eq(pdaFinalDas.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(pdaPortCosts)
        .where(and(eq(pdaPortCosts.tenantId, session.tenantId), isNull(pdaPortCosts.deletedAt), eq(pdaPortCosts.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(pdaAgentStatements)
        .where(and(eq(pdaAgentStatements.tenantId, session.tenantId), isNull(pdaAgentStatements.deletedAt), eq(pdaAgentStatements.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(pdaExpenseAllocations)
        .where(and(eq(pdaExpenseAllocations.tenantId, session.tenantId), isNull(pdaExpenseAllocations.deletedAt), eq(pdaExpenseAllocations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(pdaProformaEstimates.tenantId, session.tenantId),
    isNull(pdaProformaEstimates.deletedAt),
  ];
  if (status) conditions.push(eq(pdaProformaEstimates.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(pdaProformaEstimates.estimateRef, `%${escapeIlike(search)}%`),
        ilike(pdaProformaEstimates.vesselName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(pdaProformaEstimates.createdAt, pdaProformaEstimates.id, parsedCursor));

  const data = await db.select().from(pdaProformaEstimates)
    .where(and(...conditions))
    .orderBy(desc(pdaProformaEstimates.createdAt), desc(pdaProformaEstimates.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/port-disbursement-accounting?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Port Disbursement Accounting</h1>
          <p className="text-sm text-gray-500">Proforma DAs, final DAs, port costs, agent statements, and expense allocations</p>
        </div>
        {canCreate && (
          <Link href="/port-disbursement-accounting/proforma-estimates/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Proforma DA
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><FileText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Proformas</p><p className="text-2xl font-bold text-gray-900">{draftProformas}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><CheckCircle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Finals</p><p className="text-2xl font-bold text-gray-900">{pendingFinals}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Costs</p><p className="text-2xl font-bold text-gray-900">{activeCosts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Statements</p><p className="text-2xl font-bold text-gray-900">{openStatements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Layers className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Allocations</p><p className="text-2xl font-bold text-gray-900">{pendingAllocations}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Estimate ref, vessel name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/port-disbursement-accounting" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No proforma estimates found.</p>
          {canCreate && (
            <Link href="/port-disbursement-accounting/proforma-estimates/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first proforma DA</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Purpose</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Total Estimate</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/port-disbursement-accounting/proforma-estimates/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.estimateRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.callPurpose}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalEstimate.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "destructive" : "secondary"}>{t.status}</Badge>
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
