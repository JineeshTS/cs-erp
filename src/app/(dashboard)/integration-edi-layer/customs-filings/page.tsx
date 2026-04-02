import Link from "next/link";
import { ArrowLeft, Plus, Search, FileArchive } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { ielCustomsFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function CustomsFilingsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "integration:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const filingType = sp.filingType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(ielCustomsFilings.tenantId, session.tenantId),
    isNull(ielCustomsFilings.deletedAt),
  ];
  if (filingType) conditions.push(eq(ielCustomsFilings.filingType, filingType));
  if (status) conditions.push(eq(ielCustomsFilings.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ielCustomsFilings.filingRef, `%${escapeIlike(search)}%`),
        ilike(ielCustomsFilings.hsCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(ielCustomsFilings.createdAt, ielCustomsFilings.id, parsedCursor));

  const data = await db
    .select()
    .from(ielCustomsFilings)
    .where(and(...conditions))
    .orderBy(desc(ielCustomsFilings.createdAt), desc(ielCustomsFilings.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (filingType) p.set("filingType", filingType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/integration-edi-layer/customs-filings?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/integration-edi-layer"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customs Filings
            </h1>
            <p className="text-sm text-gray-500">
              Manage customs declarations, duties, and regulatory filings
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/integration-edi-layer/customs-filings/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Filing
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
              placeholder="Search by filing ref or HS code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="filingType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Filing Type
          </label>
          <select
            id="filingType"
            name="filingType"
            defaultValue={filingType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="import_declaration">Import Declaration</option>
            <option value="export_declaration">Export Declaration</option>
            <option value="transit_declaration">Transit Declaration</option>
            <option value="re_export">Re-Export</option>
            <option value="temporary_import">Temporary Import</option>
            <option value="free_zone">Free Zone</option>
          </select>
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
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || filingType || status) && (
          <Link
            href="/integration-edi-layer/customs-filings"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileArchive className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No customs filings found.</p>
          {canCreate && (
            <Link
              href="/integration-edi-layer/customs-filings/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first filing
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Filing Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Filing Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Customs Authority
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Declaration Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((filing) => (
                <tr
                  key={filing.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/integration-edi-layer/customs-filings/${filing.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {filing.filingRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.filingType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.customsAuthority.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.countryCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.declarationType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        filing.status === "approved" ||
                        filing.status === "cleared"
                          ? "success"
                          : filing.status === "rejected"
                            ? "destructive"
                            : filing.status === "submitted"
                              ? "default"
                              : "secondary"
                      }
                    >
                      {filing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {filing.totalValue != null
                      ? `${filing.totalValue} ${filing.currency ?? "USD"}`
                      : "-"}
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
