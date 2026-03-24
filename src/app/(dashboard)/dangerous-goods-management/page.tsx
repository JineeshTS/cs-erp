import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Shield,
  ScanLine,
  Layers,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  dgmImdgCompliance,
  dgmBookingScreenings,
  dgmSegregationRules,
  dgmManifests,
  dgmIncidentReports,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function DangerousGoodsManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "dangerous_goods:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeCompliance, pendingScreenings, activeRules, draftManifests, openIncidents] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(dgmImdgCompliance)
        .where(and(eq(dgmImdgCompliance.tenantId, session.tenantId), isNull(dgmImdgCompliance.deletedAt), eq(dgmImdgCompliance.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(dgmBookingScreenings)
        .where(and(eq(dgmBookingScreenings.tenantId, session.tenantId), isNull(dgmBookingScreenings.deletedAt), eq(dgmBookingScreenings.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(dgmSegregationRules)
        .where(and(eq(dgmSegregationRules.tenantId, session.tenantId), isNull(dgmSegregationRules.deletedAt), eq(dgmSegregationRules.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(dgmManifests)
        .where(and(eq(dgmManifests.tenantId, session.tenantId), isNull(dgmManifests.deletedAt), eq(dgmManifests.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(dgmIncidentReports)
        .where(and(eq(dgmIncidentReports.tenantId, session.tenantId), isNull(dgmIncidentReports.deletedAt), eq(dgmIncidentReports.status, "reported")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(dgmImdgCompliance.tenantId, session.tenantId),
    isNull(dgmImdgCompliance.deletedAt),
  ];
  if (status) conditions.push(eq(dgmImdgCompliance.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(dgmImdgCompliance.complianceRef, `%${escapeIlike(search)}%`),
        ilike(dgmImdgCompliance.unNumber, `%${escapeIlike(search)}%`),
        ilike(dgmImdgCompliance.properShippingName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(dgmImdgCompliance.createdAt, dgmImdgCompliance.id, parsedCursor));

  const data = await db.select().from(dgmImdgCompliance)
    .where(and(...conditions))
    .orderBy(desc(dgmImdgCompliance.createdAt), desc(dgmImdgCompliance.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/dangerous-goods-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dangerous Goods Management</h1>
          <p className="text-sm text-gray-500">IMDG compliance, booking screening, segregation, placards, manifests, emergency procedures, chemical safety, and incidents</p>
        </div>
        {canCreate && (
          <Link href="/dangerous-goods-management/imdg-compliance/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New IMDG Entry
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Compliance</p><p className="text-2xl font-bold text-gray-900">{activeCompliance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ScanLine className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Screenings</p><p className="text-2xl font-bold text-gray-900">{pendingScreenings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Layers className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Rules</p><p className="text-2xl font-bold text-gray-900">{activeRules}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><FileCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Manifests</p><p className="text-2xl font-bold text-gray-900">{draftManifests}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Incidents</p><p className="text-2xl font-bold text-gray-900">{openIncidents}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Ref, UN number, shipping name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/dangerous-goods-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No IMDG compliance entries found.</p>
          {canCreate && (
            <Link href="/dangerous-goods-management/imdg-compliance/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first IMDG entry</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">UN Number</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Proper Shipping Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">IMDG Class</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Packing Group</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/dangerous-goods-management/imdg-compliance/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.complianceRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.unNumber}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate">{t.properShippingName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.imdgClass}</td>
                  <td className="px-4 py-3 text-gray-600">{t.packingGroup || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "expired" ? "destructive" : "secondary"}>{t.status}</Badge>
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
