import Link from "next/link";
import {
  Plus,
  FileText,
  Container,
  Ship,
  AlertTriangle,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  odmBillsOfLading,
  odmManifests,
  odmRegulatoryFilings,
  odmVgmRecords,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OperationsDocumentationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "operations:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const blStatus = sp.blStatus ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftBls, pendingManifests, pendingFilings, pendingVgms] =
    await Promise.all([
      db
        .select({ id: odmBillsOfLading.id })
        .from(odmBillsOfLading)
        .where(
          and(
            eq(odmBillsOfLading.tenantId, session.tenantId),
            isNull(odmBillsOfLading.deletedAt),
            eq(odmBillsOfLading.blStatus, "draft")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: odmManifests.id })
        .from(odmManifests)
        .where(
          and(
            eq(odmManifests.tenantId, session.tenantId),
            isNull(odmManifests.deletedAt),
            eq(odmManifests.status, "draft")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: odmRegulatoryFilings.id })
        .from(odmRegulatoryFilings)
        .where(
          and(
            eq(odmRegulatoryFilings.tenantId, session.tenantId),
            isNull(odmRegulatoryFilings.deletedAt),
            eq(odmRegulatoryFilings.status, "pending")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: odmVgmRecords.id })
        .from(odmVgmRecords)
        .where(
          and(
            eq(odmVgmRecords.tenantId, session.tenantId),
            isNull(odmVgmRecords.deletedAt),
            eq(odmVgmRecords.status, "pending")
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(odmBillsOfLading.tenantId, session.tenantId),
    isNull(odmBillsOfLading.deletedAt),
  ];
  if (blStatus) conditions.push(eq(odmBillsOfLading.blStatus, blStatus));
  if (search) {
    conditions.push(
      or(
        ilike(odmBillsOfLading.blNumber, `%${search}%`),
        ilike(odmBillsOfLading.shipperName, `%${search}%`),
        ilike(odmBillsOfLading.consigneeName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(odmBillsOfLading.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(odmBillsOfLading)
    .where(and(...conditions))
    .orderBy(desc(odmBillsOfLading.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (blStatus) p.set("blStatus", blStatus);
    p.set("cursor", nextCur);
    return `/operations-documentation?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Operations & Documentation
          </h1>
          <p className="text-sm text-gray-500">
            Bills of lading, manifests, regulatory filings, and VGM management
          </p>
        </div>
        {canCreate && (
          <Link
            href="/operations-documentation/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Bill of Lading
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Draft B/Ls</p>
              <p className="text-2xl font-bold text-gray-900">{draftBls}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Draft Manifests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingManifests}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Filings</p>
              <p className="text-2xl font-bold text-gray-900">{pendingFilings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <Container className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending VGMs</p>
              <p className="text-2xl font-bold text-gray-900">{pendingVgms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="BL number, shipper, or consignee..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="blStatus" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            id="blStatus"
            name="blStatus"
            defaultValue={blStatus}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="printed">Printed</option>
            <option value="released">Released</option>
            <option value="surrendered">Surrendered</option>
            <option value="accomplished">Accomplished</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || blStatus) && (
          <Link href="/operations-documentation" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Bills of Lading Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No bills of lading found.</p>
          {canCreate && (
            <Link href="/operations-documentation/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first bill of lading
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">BL Number</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Shipper</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Consignee</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/operations-documentation/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.blNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.blType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.shipperName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.consigneeName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.blStatus === "released" || t.blStatus === "accomplished" ? "success" : t.blStatus === "draft" ? "secondary" : "default"}>
                      {t.blStatus}
                    </Badge>
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
