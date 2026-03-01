import Link from "next/link";
import { Plus, GitBranch, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { aafWorkflowDefinitions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function WorkflowDefinitionsPage({
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
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(aafWorkflowDefinitions.tenantId, session.tenantId),
    isNull(aafWorkflowDefinitions.deletedAt),
  ];
  if (search) {
    conditions.push(
      ilike(aafWorkflowDefinitions.workflowName, `%${search}%`)
    );
  }
  if (cursor) {
    conditions.push(lt(aafWorkflowDefinitions.createdAt, new Date(cursor)));
  }

  const data = await db
    .select()
    .from(aafWorkflowDefinitions)
    .where(and(...conditions))
    .orderBy(desc(aafWorkflowDefinitions.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("cursor", nextCur);
    return `/ai-agent-framework/workflows?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workflow Definitions
          </h1>
          <p className="text-sm text-gray-500">
            Define and manage automated workflow pipelines
          </p>
        </div>
        {canCreate && (
          <Link
            href="/ai-agent-framework/workflows/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Link>
        )}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Workflow name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {search && (
          <Link
            href="/ai-agent-framework/workflows"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Workflow Definitions Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <GitBranch className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No workflow definitions found.</p>
          {canCreate && (
            <Link
              href="/ai-agent-framework/workflows/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first workflow
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Workflow Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Version
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/ai-agent-framework/workflows/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.workflowName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.workflowCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.category ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">v{t.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.isActive ? "success" : "secondary"}>
                      {t.isActive ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmtDate(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
