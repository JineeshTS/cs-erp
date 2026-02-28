import Link from "next/link";
import { Plus, Star, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { csoCustomerFeedback } from "@/db/schema";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function CustomerFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "customer_service:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(csoCustomerFeedback.tenantId, session.tenantId),
    isNull(csoCustomerFeedback.deletedAt),
  ];
  if (search) {
    conditions.push(ilike(csoCustomerFeedback.feedbackText, `%${search}%`));
  }
  if (cursor) conditions.push(lt(csoCustomerFeedback.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(csoCustomerFeedback)
    .where(and(...conditions))
    .orderBy(desc(csoCustomerFeedback.createdAt))
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
    return `/customer-service-operations/customer-feedback?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-sm text-gray-500">Track customer satisfaction and feedback</p>
        </div>
        {canCreate && (
          <Link
            href="/customer-service-operations/customer-feedback/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Feedback
          </Link>
        )}
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
              placeholder="Search feedback text..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {search && (
          <Link href="/customer-service-operations/customer-feedback" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Star className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No customer feedback found.</p>
          {canCreate && (
            <Link href="/customer-service-operations/customer-feedback/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Record your first feedback
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Entity Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Score</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Channel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((record) => (
                <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/customer-service-operations/customer-feedback/${record.id}`} className="font-medium text-gray-900 hover:underline">
                      {record.entityType}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{record.customerName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{record.rating?.toString() ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{record.satisfactionScore?.toString() ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{record.feedbackChannel ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(record.createdAt)}</td>
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
