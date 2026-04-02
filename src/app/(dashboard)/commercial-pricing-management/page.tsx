import Link from "next/link";
import {
  Plus,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  cpmTariffs,
  cpmSpecialRates,
  cpmRevenueLeakages,
  cpmPricingApprovals,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function CommercialPricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "commercial:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "commercial:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const tariffType = sp.tariffType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeTariffs, activeSpecialRates, detectedLeakages, pendingApprovals] =
    await Promise.all([
      db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(cpmTariffs)
        .where(
          and(
            eq(cpmTariffs.tenantId, session.tenantId),
            isNull(cpmTariffs.deletedAt),
            eq(cpmTariffs.status, "active")
          )
        )
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(cpmSpecialRates)
        .where(
          and(
            eq(cpmSpecialRates.tenantId, session.tenantId),
            isNull(cpmSpecialRates.deletedAt),
            eq(cpmSpecialRates.status, "active")
          )
        )
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(cpmRevenueLeakages)
        .where(
          and(
            eq(cpmRevenueLeakages.tenantId, session.tenantId),
            isNull(cpmRevenueLeakages.deletedAt),
            eq(cpmRevenueLeakages.status, "detected")
          )
        )
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(cpmPricingApprovals)
        .where(
          and(
            eq(cpmPricingApprovals.tenantId, session.tenantId),
            isNull(cpmPricingApprovals.deletedAt),
            eq(cpmPricingApprovals.status, "pending")
          )
        )
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(cpmTariffs.tenantId, session.tenantId),
    isNull(cpmTariffs.deletedAt),
  ];
  if (tariffType) conditions.push(eq(cpmTariffs.tariffType, tariffType));
  if (status) conditions.push(eq(cpmTariffs.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(cpmTariffs.tariffName, `%${escapeIlike(search)}%`),
        ilike(cpmTariffs.tariffCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(cpmTariffs.createdAt, cpmTariffs.id, parsedCursor));

  const data = await db
    .select()
    .from(cpmTariffs)
    .where(and(...conditions))
    .orderBy(desc(cpmTariffs.createdAt), desc(cpmTariffs.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (tariffType) p.set("tariffType", tariffType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/commercial-pricing-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Commercial &amp; Pricing
          </h1>
          <p className="text-sm text-gray-500">
            Manage tariffs, rates, surcharges, and pricing approvals
          </p>
        </div>
        {canCreate && (
          <Link
            href="/commercial-pricing-management/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Tariff
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Tariffs</p>
              <p className="text-2xl font-bold text-gray-900">{activeTariffs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Special Rates</p>
              <p className="text-2xl font-bold text-gray-900">{activeSpecialRates}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue Leakages</p>
              <p className="text-2xl font-bold text-gray-900">{detectedLeakages}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
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
              placeholder="Tariff name or code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="tariffType" className="mb-1 block text-xs font-medium text-gray-500">Type</label>
          <select
            id="tariffType"
            name="tariffType"
            defaultValue={tariffType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="standard">Standard</option>
            <option value="contract">Contract</option>
            <option value="promotional">Promotional</option>
            <option value="spot">Spot</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || tariffType || status) && (
          <Link href="/commercial-pricing-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Tariff Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <DollarSign className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No tariffs found.</p>
          {canCreate && (
            <Link href="/commercial-pricing-management/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first tariff
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Trade Lane</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Effective From</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/commercial-pricing-management/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.tariffCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.tariffName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.tariffType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.tradeLane ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.effectiveFrom.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "expired" ? "destructive" : "secondary"}>
                      {t.status}
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
