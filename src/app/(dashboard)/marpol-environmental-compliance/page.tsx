import Link from "next/link";
import {
  Plus, FileText, Search, Shield, Droplets, Anchor,
  Trash2, Fuel, Gauge, ScrollText, AlertTriangle,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  mecAnnexCompliances, mecBallastWaters, mecAntiFoulings, mecWasteManagements,
  mecSulphurCaps, mecCiiRatings, mecCargoCharters, mecEnvironmentalIncidents,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function MarpolEnvironmentalCompliancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:read"))) redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "mec:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecAnnexCompliances).where(and(eq(mecAnnexCompliances.tenantId, session.tenantId), isNull(mecAnnexCompliances.deletedAt), eq(mecAnnexCompliances.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecBallastWaters).where(and(eq(mecBallastWaters.tenantId, session.tenantId), isNull(mecBallastWaters.deletedAt), eq(mecBallastWaters.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecAntiFoulings).where(and(eq(mecAntiFoulings.tenantId, session.tenantId), isNull(mecAntiFoulings.deletedAt), eq(mecAntiFoulings.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecWasteManagements).where(and(eq(mecWasteManagements.tenantId, session.tenantId), isNull(mecWasteManagements.deletedAt), eq(mecWasteManagements.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecSulphurCaps).where(and(eq(mecSulphurCaps.tenantId, session.tenantId), isNull(mecSulphurCaps.deletedAt), eq(mecSulphurCaps.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecCiiRatings).where(and(eq(mecCiiRatings.tenantId, session.tenantId), isNull(mecCiiRatings.deletedAt), eq(mecCiiRatings.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecCargoCharters).where(and(eq(mecCargoCharters.tenantId, session.tenantId), isNull(mecCargoCharters.deletedAt), eq(mecCargoCharters.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(mecEnvironmentalIncidents).where(and(eq(mecEnvironmentalIncidents.tenantId, session.tenantId), isNull(mecEnvironmentalIncidents.deletedAt), eq(mecEnvironmentalIncidents.status, "draft"))).then((r) => r[0]?.value ?? 0),
  ]);

  const conditions = [eq(mecAnnexCompliances.tenantId, session.tenantId), isNull(mecAnnexCompliances.deletedAt)];
  if (status) conditions.push(eq(mecAnnexCompliances.status, status));
  if (search) conditions.push(or(ilike(mecAnnexCompliances.complianceRef, `%${escapeIlike(search)}%`), ilike(mecAnnexCompliances.title, `%${escapeIlike(search)}%`))!);
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(mecAnnexCompliances.createdAt, mecAnnexCompliances.id, parsedCursor));

  const data = await db.select().from(mecAnnexCompliances).where(and(...conditions)).orderBy(desc(mecAnnexCompliances.createdAt), desc(mecAnnexCompliances.id)).limit(limit + 1);
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MARPOL & Environmental Compliance</h1>
          <p className="text-sm text-gray-500">Annex compliance, ballast water, anti-fouling, waste, sulphur caps, CII ratings, cargo charters, incidents</p>
        </div>
        {canCreate && (
          <Link href="/marpol-environmental-compliance/annex-compliances/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Compliance
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Draft Annex", count: d1, icon: Shield, color: "blue" },
          { label: "Draft Ballast", count: d2, icon: Droplets, color: "green" },
          { label: "Draft Anti-Fouling", count: d3, icon: Anchor, color: "orange" },
          { label: "Draft Waste", count: d4, icon: Trash2, color: "purple" },
          { label: "Draft Sulphur", count: d5, icon: Fuel, color: "indigo" },
          { label: "Draft CII", count: d6, icon: Gauge, color: "teal" },
          { label: "Draft Charters", count: d7, icon: ScrollText, color: "yellow" },
          { label: "Draft Incidents", count: d8, icon: AlertTriangle, color: "red" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${({ blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600", indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", yellow: "bg-yellow-50 text-yellow-600" } as Record<string, string>)[c.color] ?? ""}`}><c.icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-2xl font-bold text-gray-900">{c.count}</p></div>
            </div>
          </div>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Compliance ref, title..." className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option><option value="draft">Draft</option><option value="verified">Verified</option><option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && <Link href="/marpol-environmental-compliance" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No annex compliances found.</p>
          {canCreate && <Link href="/marpol-environmental-compliance/annex-compliances/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first annex compliance</Link>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Annex</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Compliant</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><Link href={`/marpol-environmental-compliance/annex-compliances/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.complianceRef}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{t.title || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.complianceType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.isCompliant ? "Yes" : "No"}</td>
                  <td className="px-4 py-3"><Badge variant={t.status === "verified" ? "success" : t.status === "published" ? "default" : "secondary"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={`/marpol-environmental-compliance?cursor=${nextCursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
