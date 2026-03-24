import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  UserPlus,
  Brain,
  Bell,
  Lightbulb,
  Video,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  kmtSopLibraries,
  kmtTrainingModules,
  kmtCompetencyAssessments,
  kmtOnboardingWorkflows,
  kmtKnowledgeAssistants,
  kmtRegulatoryAlerts,
  kmtLessonsLearned,
  kmtVideoLibraries,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function KnowledgeManagementTrainingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "kmt:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftSopLibraries, draftTrainingModules, draftCompetencyAssessments, draftOnboardingWorkflows, draftKnowledgeAssistants, draftRegulatoryAlerts, draftLessonsLearned, draftVideoLibraries] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtSopLibraries)
        .where(and(eq(kmtSopLibraries.tenantId, session.tenantId), isNull(kmtSopLibraries.deletedAt), eq(kmtSopLibraries.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtTrainingModules)
        .where(and(eq(kmtTrainingModules.tenantId, session.tenantId), isNull(kmtTrainingModules.deletedAt), eq(kmtTrainingModules.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtCompetencyAssessments)
        .where(and(eq(kmtCompetencyAssessments.tenantId, session.tenantId), isNull(kmtCompetencyAssessments.deletedAt), eq(kmtCompetencyAssessments.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtOnboardingWorkflows)
        .where(and(eq(kmtOnboardingWorkflows.tenantId, session.tenantId), isNull(kmtOnboardingWorkflows.deletedAt), eq(kmtOnboardingWorkflows.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtKnowledgeAssistants)
        .where(and(eq(kmtKnowledgeAssistants.tenantId, session.tenantId), isNull(kmtKnowledgeAssistants.deletedAt), eq(kmtKnowledgeAssistants.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtRegulatoryAlerts)
        .where(and(eq(kmtRegulatoryAlerts.tenantId, session.tenantId), isNull(kmtRegulatoryAlerts.deletedAt), eq(kmtRegulatoryAlerts.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtLessonsLearned)
        .where(and(eq(kmtLessonsLearned.tenantId, session.tenantId), isNull(kmtLessonsLearned.deletedAt), eq(kmtLessonsLearned.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(kmtVideoLibraries)
        .where(and(eq(kmtVideoLibraries.tenantId, session.tenantId), isNull(kmtVideoLibraries.deletedAt), eq(kmtVideoLibraries.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(kmtSopLibraries.tenantId, session.tenantId),
    isNull(kmtSopLibraries.deletedAt),
  ];
  if (status) conditions.push(eq(kmtSopLibraries.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(kmtSopLibraries.sopRef, `%${escapeIlike(search)}%`),
        ilike(kmtSopLibraries.title, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(kmtSopLibraries.createdAt, kmtSopLibraries.id, parsedCursor));

  const data = await db.select().from(kmtSopLibraries)
    .where(and(...conditions))
    .orderBy(desc(kmtSopLibraries.createdAt), desc(kmtSopLibraries.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/knowledge-management-training?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Management & Training</h1>
          <p className="text-sm text-gray-500">SOPs, training modules, competency assessments, onboarding, AI assistant, regulatory alerts, lessons learned, video library</p>
        </div>
        {canCreate && (
          <Link href="/knowledge-management-training/sop-libraries/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New SOP
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft SOPs</p><p className="text-2xl font-bold text-gray-900">{draftSopLibraries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><GraduationCap className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Training</p><p className="text-2xl font-bold text-gray-900">{draftTrainingModules}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Assessments</p><p className="text-2xl font-bold text-gray-900">{draftCompetencyAssessments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><UserPlus className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Onboarding</p><p className="text-2xl font-bold text-gray-900">{draftOnboardingWorkflows}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft AI Queries</p><p className="text-2xl font-bold text-gray-900">{draftKnowledgeAssistants}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Bell className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Reg. Alerts</p><p className="text-2xl font-bold text-gray-900">{draftRegulatoryAlerts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Lightbulb className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Lessons</p><p className="text-2xl font-bold text-gray-900">{draftLessonsLearned}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Video className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Videos</p><p className="text-2xl font-bold text-gray-900">{draftVideoLibraries}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="SOP ref, title..."
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
          <Link href="/knowledge-management-training" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No SOP library records found.</p>
          {canCreate && (
            <Link href="/knowledge-management-training/sop-libraries/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first SOP</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Department</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Version</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/knowledge-management-training/sop-libraries/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.sopRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.title || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.sopType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.department || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.versionNumber || "\u2014"}</td>
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
