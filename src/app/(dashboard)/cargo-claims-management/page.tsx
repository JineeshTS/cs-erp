import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  ClipboardList,
  Scale,
  FileSearch2,
  Clock,
  Banknote,
  ArrowRightLeft,
  Brain,
  BarChart3,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  ccmClaimRegistrations,
  ccmLiabilityAssessments,
  ccmDamageSurveys,
  ccmTimeBarTrackings,
  ccmClaimSettlements,
  ccmSubrogationRecoveries,
  ccmClaimPredictions,
  ccmPortfolioAnalytics,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function CargoClaimsManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "ccm:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftClaimRegistrations, draftLiabilityAssessments, draftDamageSurveys, draftTimeBarTrackings, draftClaimSettlements, draftSubrogationRecoveries, draftClaimPredictions, draftPortfolioAnalytics] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmClaimRegistrations)
        .where(and(eq(ccmClaimRegistrations.tenantId, session.tenantId), isNull(ccmClaimRegistrations.deletedAt), eq(ccmClaimRegistrations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmLiabilityAssessments)
        .where(and(eq(ccmLiabilityAssessments.tenantId, session.tenantId), isNull(ccmLiabilityAssessments.deletedAt), eq(ccmLiabilityAssessments.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmDamageSurveys)
        .where(and(eq(ccmDamageSurveys.tenantId, session.tenantId), isNull(ccmDamageSurveys.deletedAt), eq(ccmDamageSurveys.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmTimeBarTrackings)
        .where(and(eq(ccmTimeBarTrackings.tenantId, session.tenantId), isNull(ccmTimeBarTrackings.deletedAt), eq(ccmTimeBarTrackings.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmClaimSettlements)
        .where(and(eq(ccmClaimSettlements.tenantId, session.tenantId), isNull(ccmClaimSettlements.deletedAt), eq(ccmClaimSettlements.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmSubrogationRecoveries)
        .where(and(eq(ccmSubrogationRecoveries.tenantId, session.tenantId), isNull(ccmSubrogationRecoveries.deletedAt), eq(ccmSubrogationRecoveries.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmClaimPredictions)
        .where(and(eq(ccmClaimPredictions.tenantId, session.tenantId), isNull(ccmClaimPredictions.deletedAt), eq(ccmClaimPredictions.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ccmPortfolioAnalytics)
        .where(and(eq(ccmPortfolioAnalytics.tenantId, session.tenantId), isNull(ccmPortfolioAnalytics.deletedAt), eq(ccmPortfolioAnalytics.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(ccmClaimRegistrations.tenantId, session.tenantId),
    isNull(ccmClaimRegistrations.deletedAt),
  ];
  if (status) conditions.push(eq(ccmClaimRegistrations.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ccmClaimRegistrations.claimRef, `%${escapeIlike(search)}%`),
        ilike(ccmClaimRegistrations.vesselName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(ccmClaimRegistrations.createdAt, ccmClaimRegistrations.id, parsedCursor));

  const data = await db.select().from(ccmClaimRegistrations)
    .where(and(...conditions))
    .orderBy(desc(ccmClaimRegistrations.createdAt), desc(ccmClaimRegistrations.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/cargo-claims-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cargo Claims Management</h1>
          <p className="text-sm text-gray-500">Claim registration, liability assessment, damage surveys, time bars, settlements, subrogation, predictions, and portfolio analytics</p>
        </div>
        {canCreate && (
          <Link href="/cargo-claims-management/claim-registrations/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Claim
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Claims</p><p className="text-2xl font-bold text-gray-900">{draftClaimRegistrations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Scale className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Liability</p><p className="text-2xl font-bold text-gray-900">{draftLiabilityAssessments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><FileSearch2 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Surveys</p><p className="text-2xl font-bold text-gray-900">{draftDamageSurveys}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Clock className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Time Bars</p><p className="text-2xl font-bold text-gray-900">{draftTimeBarTrackings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Banknote className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Settlements</p><p className="text-2xl font-bold text-gray-900">{draftClaimSettlements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><ArrowRightLeft className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Recoveries</p><p className="text-2xl font-bold text-gray-900">{draftSubrogationRecoveries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Predictions</p><p className="text-2xl font-bold text-gray-900">{draftClaimPredictions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Analytics</p><p className="text-2xl font-bold text-gray-900">{draftPortfolioAnalytics}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Claim ref, vessel..."
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
          <Link href="/cargo-claims-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No claim registrations found.</p>
          {canCreate && (
            <Link href="/cargo-claims-management/claim-registrations/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Register your first claim</Link>
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
                <th className="px-4 py-3 text-start font-medium text-gray-500">Claimant</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Amount (USD)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/cargo-claims-management/claim-registrations/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.claimRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.claimType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.claimantName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.claimAmountUsd ?? "-"}</td>
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
