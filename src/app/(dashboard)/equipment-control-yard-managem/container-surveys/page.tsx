import Link from "next/link";
import { Plus, Search, ClipboardCheck } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { eqyContainerSurveys } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function ContainerSurveysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(eqyContainerSurveys.tenantId, session.tenantId),
    isNull(eqyContainerSurveys.deletedAt),
  ];
  if (status) conditions.push(eq(eqyContainerSurveys.status, status));
  if (search) {
    conditions.push(
      ilike(eqyContainerSurveys.containerNumber, `%${escapeIlike(search)}%`)
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(eqyContainerSurveys.createdAt, eqyContainerSurveys.id, parsedCursor));

  const data = await db
    .select()
    .from(eqyContainerSurveys)
    .where(and(...conditions))
    .orderBy(desc(eqyContainerSurveys.createdAt), desc(eqyContainerSurveys.id))
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
    return `/equipment-control-yard-managem/container-surveys?${p.toString()}`;
  }

  const statusVariant = (s: string) => {
    switch (s) {
      case "completed":
        return "success" as const;
      case "in_progress":
        return "default" as const;
      case "reviewed":
        return "secondary" as const;
      case "scheduled":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const conditionVariant = (c: string | null) => {
    switch (c) {
      case "good":
        return "success" as const;
      case "fair":
        return "default" as const;
      case "poor":
        return "destructive" as const;
      case "condemned":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Container Surveys
          </h1>
          <p className="text-sm text-gray-500">
            Manage container surveys and inspection records
          </p>
        </div>
        {canCreate && (
          <Link
            href="/equipment-control-yard-managem/container-surveys/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Survey
          </Link>
        )}
      </div>

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
              placeholder="Container number..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/equipment-control-yard-managem/container-surveys"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No container surveys found.</p>
          {canCreate && (
            <Link
              href="/equipment-control-yard-managem/container-surveys/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first survey
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Reference
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Condition
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/equipment-control-yard-managem/container-surveys/${r.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {r.surveyReference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.containerNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.surveyType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.surveyDate
                      ? new Date(r.surveyDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {r.overallCondition ? (
                      <Badge variant={conditionVariant(r.overallCondition)}>
                        {r.overallCondition}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)}>
                      {r.status.replace(/_/g, " ")}
                    </Badge>
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
