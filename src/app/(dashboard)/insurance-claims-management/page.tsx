import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Shield,
  Anchor,
  Package,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  icmPiClubPolicies,
  icmHullMachineryInsurances,
  icmCargoInsurancePolicies,
  icmClaimsRegistrations,
  icmClaimsRecoveries,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function InsuranceClaimsManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "insurance:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activePi, activeHull, activeCargo, openClaims, openRecoveries] =
    await Promise.all([
      db.select({ id: icmPiClubPolicies.id }).from(icmPiClubPolicies)
        .where(and(eq(icmPiClubPolicies.tenantId, session.tenantId), isNull(icmPiClubPolicies.deletedAt), eq(icmPiClubPolicies.status, "active")))
        .then((r) => r.length),
      db.select({ id: icmHullMachineryInsurances.id }).from(icmHullMachineryInsurances)
        .where(and(eq(icmHullMachineryInsurances.tenantId, session.tenantId), isNull(icmHullMachineryInsurances.deletedAt), eq(icmHullMachineryInsurances.status, "active")))
        .then((r) => r.length),
      db.select({ id: icmCargoInsurancePolicies.id }).from(icmCargoInsurancePolicies)
        .where(and(eq(icmCargoInsurancePolicies.tenantId, session.tenantId), isNull(icmCargoInsurancePolicies.deletedAt), eq(icmCargoInsurancePolicies.status, "active")))
        .then((r) => r.length),
      db.select({ id: icmClaimsRegistrations.id }).from(icmClaimsRegistrations)
        .where(and(eq(icmClaimsRegistrations.tenantId, session.tenantId), isNull(icmClaimsRegistrations.deletedAt), eq(icmClaimsRegistrations.status, "open")))
        .then((r) => r.length),
      db.select({ id: icmClaimsRecoveries.id }).from(icmClaimsRecoveries)
        .where(and(eq(icmClaimsRecoveries.tenantId, session.tenantId), isNull(icmClaimsRecoveries.deletedAt), eq(icmClaimsRecoveries.status, "open")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(icmPiClubPolicies.tenantId, session.tenantId),
    isNull(icmPiClubPolicies.deletedAt),
  ];
  if (status) conditions.push(eq(icmPiClubPolicies.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(icmPiClubPolicies.policyRef, `%${search}%`),
        ilike(icmPiClubPolicies.clubName, `%${search}%`),
        ilike(icmPiClubPolicies.vesselName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(icmPiClubPolicies.createdAt, new Date(cursor)));

  const data = await db.select().from(icmPiClubPolicies)
    .where(and(...conditions))
    .orderBy(desc(icmPiClubPolicies.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/insurance-claims-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance & Claims Management</h1>
          <p className="text-sm text-gray-500">P&I club policies, hull & machinery, cargo insurance, claims, recoveries, predictions, and loss prevention</p>
        </div>
        {canCreate && (
          <Link href="/insurance-claims-management/pi-club-policies/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New P&I Policy
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">P&I Policies</p><p className="text-2xl font-bold text-gray-900">{activePi}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">H&M Insurances</p><p className="text-2xl font-bold text-gray-900">{activeHull}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Cargo Insurance</p><p className="text-2xl font-bold text-gray-900">{activeCargo}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Claims</p><p className="text-2xl font-bold text-gray-900">{openClaims}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Recoveries</p><p className="text-2xl font-bold text-gray-900">{openRecoveries}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Policy ref, club, vessel..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/insurance-claims-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No P&I club policies found.</p>
          {canCreate && (
            <Link href="/insurance-claims-management/pi-club-policies/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first P&I policy</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Club</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Broker</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/insurance-claims-management/pi-club-policies/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.policyRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.clubName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.policyType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.brokerName || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "expired" ? "destructive" : t.status === "cancelled" ? "destructive" : "secondary"}>{t.status}</Badge>
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
