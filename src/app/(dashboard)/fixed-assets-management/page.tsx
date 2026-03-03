import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Boxes,
  CalendarRange,
  Trash2,
  Shield,
  Wrench,
  BarChart3,
  AlertTriangle,
  FileKey,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  famAssetRegistries,
  famDepreciationSchedules,
  famAssetDisposals,
  famInsuranceValuations,
  famMaintenanceSchedules,
  famCapexOpexClassifications,
  famImpairmentTests,
  famLeaseAccounting,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FixedAssetsManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "asset:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeAssets, activeSchedules, draftDisposals, activeInsurance, scheduledMaintenance, draftClassifications, draftImpairments, activeLeases] =
    await Promise.all([
      db.select({ id: famAssetRegistries.id }).from(famAssetRegistries)
        .where(and(eq(famAssetRegistries.tenantId, session.tenantId), isNull(famAssetRegistries.deletedAt), eq(famAssetRegistries.status, "active")))
        .then((r) => r.length),
      db.select({ id: famDepreciationSchedules.id }).from(famDepreciationSchedules)
        .where(and(eq(famDepreciationSchedules.tenantId, session.tenantId), isNull(famDepreciationSchedules.deletedAt), eq(famDepreciationSchedules.status, "active")))
        .then((r) => r.length),
      db.select({ id: famAssetDisposals.id }).from(famAssetDisposals)
        .where(and(eq(famAssetDisposals.tenantId, session.tenantId), isNull(famAssetDisposals.deletedAt), eq(famAssetDisposals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famInsuranceValuations.id }).from(famInsuranceValuations)
        .where(and(eq(famInsuranceValuations.tenantId, session.tenantId), isNull(famInsuranceValuations.deletedAt), eq(famInsuranceValuations.status, "active")))
        .then((r) => r.length),
      db.select({ id: famMaintenanceSchedules.id }).from(famMaintenanceSchedules)
        .where(and(eq(famMaintenanceSchedules.tenantId, session.tenantId), isNull(famMaintenanceSchedules.deletedAt), eq(famMaintenanceSchedules.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: famCapexOpexClassifications.id }).from(famCapexOpexClassifications)
        .where(and(eq(famCapexOpexClassifications.tenantId, session.tenantId), isNull(famCapexOpexClassifications.deletedAt), eq(famCapexOpexClassifications.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famImpairmentTests.id }).from(famImpairmentTests)
        .where(and(eq(famImpairmentTests.tenantId, session.tenantId), isNull(famImpairmentTests.deletedAt), eq(famImpairmentTests.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famLeaseAccounting.id }).from(famLeaseAccounting)
        .where(and(eq(famLeaseAccounting.tenantId, session.tenantId), isNull(famLeaseAccounting.deletedAt), eq(famLeaseAccounting.status, "active")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(famAssetRegistries.tenantId, session.tenantId),
    isNull(famAssetRegistries.deletedAt),
  ];
  if (status) conditions.push(eq(famAssetRegistries.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(famAssetRegistries.assetRef, `%${search}%`),
        ilike(famAssetRegistries.assetName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(famAssetRegistries.createdAt, new Date(cursor)));

  const data = await db.select().from(famAssetRegistries)
    .where(and(...conditions))
    .orderBy(desc(famAssetRegistries.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/fixed-assets-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fixed Assets Management</h1>
          <p className="text-sm text-gray-500">Asset registries, depreciation, disposals, insurance, maintenance, CAPEX/OPEX, impairment, and lease accounting</p>
        </div>
        {canCreate && (
          <Link href="/fixed-assets-management/asset-registries/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Asset
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Boxes className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Assets</p><p className="text-2xl font-bold text-gray-900">{activeAssets}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><CalendarRange className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Schedules</p><p className="text-2xl font-bold text-gray-900">{activeSchedules}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Trash2 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Disposals</p><p className="text-2xl font-bold text-gray-900">{draftDisposals}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Insurance</p><p className="text-2xl font-bold text-gray-900">{activeInsurance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Wrench className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Scheduled Maintenance</p><p className="text-2xl font-bold text-gray-900">{scheduledMaintenance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Classifications</p><p className="text-2xl font-bold text-gray-900">{draftClassifications}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Impairments</p><p className="text-2xl font-bold text-gray-900">{draftImpairments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><FileKey className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Leases</p><p className="text-2xl font-bold text-gray-900">{activeLeases}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Asset ref, name..."
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
            <option value="disposed">Disposed</option>
            <option value="under_maintenance">Under Maintenance</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/fixed-assets-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No asset registries found.</p>
          {canCreate && (
            <Link href="/fixed-assets-management/asset-registries/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Register your first asset</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Condition</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/fixed-assets-management/asset-registries/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.assetRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.assetName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.assetType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.location || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.condition || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "disposed" ? "destructive" : "secondary"}>{t.status}</Badge>
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
