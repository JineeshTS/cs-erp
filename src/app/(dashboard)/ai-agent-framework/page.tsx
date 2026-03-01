import Link from "next/link";
import {
  Plus,
  Bot,
  Activity,
  AlertTriangle,
  FileSearch,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  aafAgents,
  aafAgentRuns,
  aafEscalations,
  aafDocumentProcessingJobs,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiAgentFrameworkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ai:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeAgents, runningTasks, pendingEscalations, processingJobs] =
    await Promise.all([
      db
        .select({ id: aafAgents.id })
        .from(aafAgents)
        .where(
          and(
            eq(aafAgents.tenantId, session.tenantId),
            isNull(aafAgents.deletedAt),
            eq(aafAgents.isActive, true)
          )
        )
        .then((r) => r.length),
      db
        .select({ id: aafAgentRuns.id })
        .from(aafAgentRuns)
        .where(
          and(
            eq(aafAgentRuns.tenantId, session.tenantId),
            isNull(aafAgentRuns.deletedAt),
            eq(aafAgentRuns.status, "running")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: aafEscalations.id })
        .from(aafEscalations)
        .where(
          and(
            eq(aafEscalations.tenantId, session.tenantId),
            isNull(aafEscalations.deletedAt),
            eq(aafEscalations.status, "open")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: aafDocumentProcessingJobs.id })
        .from(aafDocumentProcessingJobs)
        .where(
          and(
            eq(aafDocumentProcessingJobs.tenantId, session.tenantId),
            isNull(aafDocumentProcessingJobs.deletedAt),
            eq(aafDocumentProcessingJobs.status, "processing")
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(aafAgents.tenantId, session.tenantId),
    isNull(aafAgents.deletedAt),
  ];
  if (status) conditions.push(eq(aafAgents.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(aafAgents.agentName, `%${search}%`),
        ilike(aafAgents.agentCode, `%${search}%`),
        ilike(aafAgents.agentType, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(aafAgents.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(aafAgents)
    .where(and(...conditions))
    .orderBy(desc(aafAgents.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/ai-agent-framework?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI Agent Framework
          </h1>
          <p className="text-sm text-gray-500">
            Multi-agent orchestration, document intelligence, and workflow automation
          </p>
        </div>
        {canCreate && (
          <Link
            href="/ai-agent-framework/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Running Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{runningTasks}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Escalations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingEscalations}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{processingJobs}</p>
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
              placeholder="Agent name, code, or type..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
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
            <option value="idle">Idle</option>
            <option value="running">Running</option>
            <option value="error">Error</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/ai-agent-framework" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Agents Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Bot className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No agents found.</p>
          {canCreate && (
            <Link href="/ai-agent-framework/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first agent
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Agent Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Provider</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Active</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/ai-agent-framework/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.agentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.agentCode}</td>
                  <td className="px-4 py-3 text-gray-600">{t.agentType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.modelProvider ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.isActive ? "success" : "secondary"}>
                      {t.isActive ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "running" ? "success" : t.status === "error" ? "destructive" : t.status === "idle" ? "secondary" : "default"}>
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
