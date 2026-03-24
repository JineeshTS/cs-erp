import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  ClipboardCheck,
  FileOutput,
  ArrowRightLeft,
  Calculator,
  Shield,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  ccrImportClearances,
  ccrExportFilings,
  ccrTransitProcedures,
  ccrDutyCalculations,
  ccrAeoCompliances,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function CustomsComplianceRegulatoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "customs:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [pendingClearances, pendingFilings, activeTransits, pendingCalculations, activeAeoCompliances] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccrImportClearances)
        .where(and(eq(ccrImportClearances.tenantId, session.tenantId), isNull(ccrImportClearances.deletedAt), eq(ccrImportClearances.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccrExportFilings)
        .where(and(eq(ccrExportFilings.tenantId, session.tenantId), isNull(ccrExportFilings.deletedAt), eq(ccrExportFilings.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccrTransitProcedures)
        .where(and(eq(ccrTransitProcedures.tenantId, session.tenantId), isNull(ccrTransitProcedures.deletedAt), eq(ccrTransitProcedures.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccrDutyCalculations)
        .where(and(eq(ccrDutyCalculations.tenantId, session.tenantId), isNull(ccrDutyCalculations.deletedAt), eq(ccrDutyCalculations.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccrAeoCompliances)
        .where(and(eq(ccrAeoCompliances.tenantId, session.tenantId), isNull(ccrAeoCompliances.deletedAt), eq(ccrAeoCompliances.status, "active")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(ccrImportClearances.tenantId, session.tenantId),
    isNull(ccrImportClearances.deletedAt),
  ];
  if (status) conditions.push(eq(ccrImportClearances.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ccrImportClearances.clearanceRef, `%${escapeIlike(search)}%`),
        ilike(ccrImportClearances.importerName, `%${escapeIlike(search)}%`),
        ilike(ccrImportClearances.blNumber, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(ccrImportClearances.createdAt, ccrImportClearances.id, parsedCursor));

  const data = await db.select().from(ccrImportClearances)
    .where(and(...conditions))
    .orderBy(desc(ccrImportClearances.createdAt), desc(ccrImportClearances.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/customs-compliance-regulatory?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customs Compliance & Regulatory</h1>
          <p className="text-sm text-gray-500">Import clearances, export filings, transit procedures, duty calculations, AEO, ISPS, PSC, and IMO regulations</p>
        </div>
        {canCreate && (
          <Link href="/customs-compliance-regulatory/import-clearances/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Clearance
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Clearances</p><p className="text-2xl font-bold text-gray-900">{pendingClearances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><FileOutput className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Filings</p><p className="text-2xl font-bold text-gray-900">{pendingFilings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ArrowRightLeft className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Transits</p><p className="text-2xl font-bold text-gray-900">{activeTransits}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Calculator className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Calculations</p><p className="text-2xl font-bold text-gray-900">{pendingCalculations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active AEO</p><p className="text-2xl font-bold text-gray-900">{activeAeoCompliances}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Clearance ref, importer, BL..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="filed">Filed</option>
            <option value="cleared">Cleared</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/customs-compliance-regulatory" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No import clearances found.</p>
          {canCreate && (
            <Link href="/customs-compliance-regulatory/import-clearances/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first import clearance</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Importer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port of Entry</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">BL Number</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/customs-compliance-regulatory/import-clearances/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.clearanceRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.importerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.declarationType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portOfEntry || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.blNumber || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "cleared" ? "success" : t.status === "rejected" ? "destructive" : t.status === "pending" ? "warning" : "secondary"}>{t.status}</Badge>
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
