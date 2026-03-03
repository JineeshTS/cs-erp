import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Footprints,
  Factory,
  Ship,
  Compass,
  MapPinned,
  Fuel,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  serCarbonFootprints,
  serGhgReports,
  serSeaCargoCharters,
  serPoseidonAlignments,
  serDecarbRoadmaps,
  serAltFuelTrackings,
  serEsgKpis,
  serTcfdReports,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SustainabilityEsgReportingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "ser:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftCarbonFootprints, draftGhgReports, draftSeaCargoCharters, draftPoseidonAlignments, draftDecarbRoadmaps, draftAltFuelTrackings, draftEsgKpis, draftTcfdReports] =
    await Promise.all([
      db.select({ id: serCarbonFootprints.id }).from(serCarbonFootprints)
        .where(and(eq(serCarbonFootprints.tenantId, session.tenantId), isNull(serCarbonFootprints.deletedAt), eq(serCarbonFootprints.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serGhgReports.id }).from(serGhgReports)
        .where(and(eq(serGhgReports.tenantId, session.tenantId), isNull(serGhgReports.deletedAt), eq(serGhgReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serSeaCargoCharters.id }).from(serSeaCargoCharters)
        .where(and(eq(serSeaCargoCharters.tenantId, session.tenantId), isNull(serSeaCargoCharters.deletedAt), eq(serSeaCargoCharters.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serPoseidonAlignments.id }).from(serPoseidonAlignments)
        .where(and(eq(serPoseidonAlignments.tenantId, session.tenantId), isNull(serPoseidonAlignments.deletedAt), eq(serPoseidonAlignments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serDecarbRoadmaps.id }).from(serDecarbRoadmaps)
        .where(and(eq(serDecarbRoadmaps.tenantId, session.tenantId), isNull(serDecarbRoadmaps.deletedAt), eq(serDecarbRoadmaps.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serAltFuelTrackings.id }).from(serAltFuelTrackings)
        .where(and(eq(serAltFuelTrackings.tenantId, session.tenantId), isNull(serAltFuelTrackings.deletedAt), eq(serAltFuelTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serEsgKpis.id }).from(serEsgKpis)
        .where(and(eq(serEsgKpis.tenantId, session.tenantId), isNull(serEsgKpis.deletedAt), eq(serEsgKpis.status, "draft")))
        .then((r) => r.length),
      db.select({ id: serTcfdReports.id }).from(serTcfdReports)
        .where(and(eq(serTcfdReports.tenantId, session.tenantId), isNull(serTcfdReports.deletedAt), eq(serTcfdReports.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(serCarbonFootprints.tenantId, session.tenantId),
    isNull(serCarbonFootprints.deletedAt),
  ];
  if (status) conditions.push(eq(serCarbonFootprints.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(serCarbonFootprints.footprintRef, `%${search}%`),
        ilike(serCarbonFootprints.vesselName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(serCarbonFootprints.createdAt, new Date(cursor)));

  const data = await db.select().from(serCarbonFootprints)
    .where(and(...conditions))
    .orderBy(desc(serCarbonFootprints.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/sustainability-esg-reporting?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sustainability & ESG Reporting</h1>
          <p className="text-sm text-gray-500">Carbon footprints, GHG reports, sea cargo charters, POSEIDON alignment, decarbonization, alt fuels, ESG KPIs, and TCFD</p>
        </div>
        {canCreate && (
          <Link href="/sustainability-esg-reporting/carbon-footprints/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Footprint
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Footprints className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Footprints</p><p className="text-2xl font-bold text-gray-900">{draftCarbonFootprints}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Factory className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft GHG Reports</p><p className="text-2xl font-bold text-gray-900">{draftGhgReports}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Charters</p><p className="text-2xl font-bold text-gray-900">{draftSeaCargoCharters}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Compass className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft POSEIDON</p><p className="text-2xl font-bold text-gray-900">{draftPoseidonAlignments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><MapPinned className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Roadmaps</p><p className="text-2xl font-bold text-gray-900">{draftDecarbRoadmaps}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Fuel className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Alt Fuels</p><p className="text-2xl font-bold text-gray-900">{draftAltFuelTrackings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft ESG KPIs</p><p className="text-2xl font-bold text-gray-900">{draftEsgKpis}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><FileBarChart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft TCFD</p><p className="text-2xl font-bold text-gray-900">{draftTcfdReports}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Footprint ref, vessel..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/sustainability-esg-reporting" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No carbon footprints found.</p>
          {canCreate && (
            <Link href="/sustainability-esg-reporting/carbon-footprints/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first carbon footprint</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">CO2e (MT)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Fuel Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/sustainability-esg-reporting/carbon-footprints/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.footprintRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.footprintType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.co2eEmissionsMt || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.fuelType || "\u2014"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "verified" ? "success" : t.status === "published" ? "default" : "secondary"}>{t.status}</Badge>
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
