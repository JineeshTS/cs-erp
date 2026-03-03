import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  FileCheck,
  ArrowRightLeft,
  Wrench,
  Calculator,
  CheckSquare,
  DoorOpen,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  clmLeaseAgreements,
  clmOnhireOffhires,
  clmMnrDamageBillings,
  clmLeaseCostAllocations,
  clmLessorReconciliations,
  clmContainerRedeliveries,
  clmLeaseVsBuyAnalyses,
  clmFleetOptimizers,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ContainerLeasingManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "clm:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftLeaseAgreements, draftOnhireOffhires, draftMnrDamageBillings, draftLeaseCostAllocations, draftLessorReconciliations, draftContainerRedeliveries, draftLeaseVsBuyAnalyses, draftFleetOptimizers] =
    await Promise.all([
      db.select({ id: clmLeaseAgreements.id }).from(clmLeaseAgreements)
        .where(and(eq(clmLeaseAgreements.tenantId, session.tenantId), isNull(clmLeaseAgreements.deletedAt), eq(clmLeaseAgreements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmOnhireOffhires.id }).from(clmOnhireOffhires)
        .where(and(eq(clmOnhireOffhires.tenantId, session.tenantId), isNull(clmOnhireOffhires.deletedAt), eq(clmOnhireOffhires.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmMnrDamageBillings.id }).from(clmMnrDamageBillings)
        .where(and(eq(clmMnrDamageBillings.tenantId, session.tenantId), isNull(clmMnrDamageBillings.deletedAt), eq(clmMnrDamageBillings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLeaseCostAllocations.id }).from(clmLeaseCostAllocations)
        .where(and(eq(clmLeaseCostAllocations.tenantId, session.tenantId), isNull(clmLeaseCostAllocations.deletedAt), eq(clmLeaseCostAllocations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLessorReconciliations.id }).from(clmLessorReconciliations)
        .where(and(eq(clmLessorReconciliations.tenantId, session.tenantId), isNull(clmLessorReconciliations.deletedAt), eq(clmLessorReconciliations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmContainerRedeliveries.id }).from(clmContainerRedeliveries)
        .where(and(eq(clmContainerRedeliveries.tenantId, session.tenantId), isNull(clmContainerRedeliveries.deletedAt), eq(clmContainerRedeliveries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmLeaseVsBuyAnalyses.id }).from(clmLeaseVsBuyAnalyses)
        .where(and(eq(clmLeaseVsBuyAnalyses.tenantId, session.tenantId), isNull(clmLeaseVsBuyAnalyses.deletedAt), eq(clmLeaseVsBuyAnalyses.status, "draft")))
        .then((r) => r.length),
      db.select({ id: clmFleetOptimizers.id }).from(clmFleetOptimizers)
        .where(and(eq(clmFleetOptimizers.tenantId, session.tenantId), isNull(clmFleetOptimizers.deletedAt), eq(clmFleetOptimizers.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(clmLeaseAgreements.tenantId, session.tenantId),
    isNull(clmLeaseAgreements.deletedAt),
  ];
  if (status) conditions.push(eq(clmLeaseAgreements.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(clmLeaseAgreements.agreementRef, `%${search}%`),
        ilike(clmLeaseAgreements.lessorName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(clmLeaseAgreements.createdAt, new Date(cursor)));

  const data = await db.select().from(clmLeaseAgreements)
    .where(and(...conditions))
    .orderBy(desc(clmLeaseAgreements.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/container-leasing-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Container Leasing Management</h1>
          <p className="text-sm text-gray-500">Lease agreements, on-hire/off-hire, MNR billing, cost allocation, reconciliation, redelivery, lease-vs-buy, and fleet optimization</p>
        </div>
        {canCreate && (
          <Link href="/container-leasing-management/lease-agreements/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Lease
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><FileCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Leases</p><p className="text-2xl font-bold text-gray-900">{draftLeaseAgreements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><ArrowRightLeft className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft On/Off-Hire</p><p className="text-2xl font-bold text-gray-900">{draftOnhireOffhires}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Wrench className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft MNR Billings</p><p className="text-2xl font-bold text-gray-900">{draftMnrDamageBillings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Calculator className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cost Alloc.</p><p className="text-2xl font-bold text-gray-900">{draftLeaseCostAllocations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><CheckSquare className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Reconcil.</p><p className="text-2xl font-bold text-gray-900">{draftLessorReconciliations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><DoorOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Redeliveries</p><p className="text-2xl font-bold text-gray-900">{draftContainerRedeliveries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Lease vs Buy</p><p className="text-2xl font-bold text-gray-900">{draftLeaseVsBuyAnalyses}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Cpu className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Fleet Opt.</p><p className="text-2xl font-bold text-gray-900">{draftFleetOptimizers}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Agreement ref, lessor..."
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
          <Link href="/container-leasing-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No lease agreements found.</p>
          {canCreate && (
            <Link href="/container-leasing-management/lease-agreements/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first lease agreement</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Lessor</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Daily Rate</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/container-leasing-management/lease-agreements/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.agreementRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.lessorName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.agreementType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerType || "-"} {t.containerSize || ""}</td>
                  <td className="px-4 py-3 text-gray-600">{t.dailyRate ?? "-"}</td>
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
