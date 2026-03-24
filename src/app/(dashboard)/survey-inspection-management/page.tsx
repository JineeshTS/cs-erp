import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Package,
  Container,
  Ruler,
  Ship,
  DoorOpen,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  simCargoSurveys,
  simContainerSurveys,
  simDraftSurveys,
  simHireSurveys,
  simHatchInspections,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function SurveyInspectionManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "survey:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [scheduledCargo, scheduledContainer, scheduledDraft, scheduledHire, scheduledHatch] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(simCargoSurveys)
        .where(and(eq(simCargoSurveys.tenantId, session.tenantId), isNull(simCargoSurveys.deletedAt), eq(simCargoSurveys.status, "scheduled")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(simContainerSurveys)
        .where(and(eq(simContainerSurveys.tenantId, session.tenantId), isNull(simContainerSurveys.deletedAt), eq(simContainerSurveys.status, "scheduled")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(simDraftSurveys)
        .where(and(eq(simDraftSurveys.tenantId, session.tenantId), isNull(simDraftSurveys.deletedAt), eq(simDraftSurveys.status, "scheduled")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(simHireSurveys)
        .where(and(eq(simHireSurveys.tenantId, session.tenantId), isNull(simHireSurveys.deletedAt), eq(simHireSurveys.status, "scheduled")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(simHatchInspections)
        .where(and(eq(simHatchInspections.tenantId, session.tenantId), isNull(simHatchInspections.deletedAt), eq(simHatchInspections.status, "scheduled")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(simCargoSurveys.tenantId, session.tenantId),
    isNull(simCargoSurveys.deletedAt),
  ];
  if (status) conditions.push(eq(simCargoSurveys.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(simCargoSurveys.surveyRef, `%${escapeIlike(search)}%`),
        ilike(simCargoSurveys.vesselName, `%${escapeIlike(search)}%`),
        ilike(simCargoSurveys.clientName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(simCargoSurveys.createdAt, simCargoSurveys.id, parsedCursor));

  const data = await db.select().from(simCargoSurveys)
    .where(and(...conditions))
    .orderBy(desc(simCargoSurveys.createdAt), desc(simCargoSurveys.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/survey-inspection-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey & Inspection Management</h1>
          <p className="text-sm text-gray-500">Cargo surveys, container surveys, draft surveys, hire surveys, hatch inspections, reefer PTI, classification, and reports</p>
        </div>
        {canCreate && (
          <Link href="/survey-inspection-management/cargo-surveys/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Cargo Survey
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Cargo Surveys</p><p className="text-2xl font-bold text-gray-900">{scheduledCargo}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Container className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Container Surveys</p><p className="text-2xl font-bold text-gray-900">{scheduledContainer}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Ruler className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Surveys</p><p className="text-2xl font-bold text-gray-900">{scheduledDraft}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Hire Surveys</p><p className="text-2xl font-bold text-gray-900">{scheduledHire}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><DoorOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Hatch Inspections</p><p className="text-2xl font-bold text-gray-900">{scheduledHatch}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Survey ref, vessel, client..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/survey-inspection-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cargo surveys found.</p>
          {canCreate && (
            <Link href="/survey-inspection-management/cargo-surveys/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first cargo survey</Link>
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
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/survey-inspection-management/cargo-surveys/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.surveyRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.vesselName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.surveyType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.clientName || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "completed" ? "success" : t.status === "cancelled" ? "destructive" : t.status === "in_progress" ? "warning" : "secondary"}>{t.status}</Badge>
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
