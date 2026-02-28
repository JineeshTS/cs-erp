import Link from "next/link";
import {
  Plus,
  MessageSquare,
  AlertOctagon,
  ClipboardList,
  Clock,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  csoInquiries,
  csoComplaints,
  csoServiceRequests,
  csoSlaBreaches,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CustomerServicePage({
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
  const priority = sp.priority ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [openInquiries, openComplaints, activeRequests, slaBreaches] =
    await Promise.all([
      db
        .select({ id: csoInquiries.id })
        .from(csoInquiries)
        .where(
          and(
            eq(csoInquiries.tenantId, session.tenantId),
            isNull(csoInquiries.deletedAt),
            eq(csoInquiries.status, "open")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: csoComplaints.id })
        .from(csoComplaints)
        .where(
          and(
            eq(csoComplaints.tenantId, session.tenantId),
            isNull(csoComplaints.deletedAt),
            eq(csoComplaints.status, "open")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: csoServiceRequests.id })
        .from(csoServiceRequests)
        .where(
          and(
            eq(csoServiceRequests.tenantId, session.tenantId),
            isNull(csoServiceRequests.deletedAt),
            eq(csoServiceRequests.status, "in_progress")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: csoSlaBreaches.id })
        .from(csoSlaBreaches)
        .where(
          and(
            eq(csoSlaBreaches.tenantId, session.tenantId),
            isNull(csoSlaBreaches.deletedAt),
            eq(csoSlaBreaches.acknowledged, false)
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(csoInquiries.tenantId, session.tenantId),
    isNull(csoInquiries.deletedAt),
  ];
  if (priority) conditions.push(eq(csoInquiries.priority, priority));
  if (status) conditions.push(eq(csoInquiries.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(csoInquiries.subject, `%${search}%`),
        ilike(csoInquiries.customerName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(csoInquiries.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(csoInquiries)
    .where(and(...conditions))
    .orderBy(desc(csoInquiries.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (priority) p.set("priority", priority);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/customer-service-operations?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Service Operations
          </h1>
          <p className="text-sm text-gray-500">
            Manage inquiries, complaints, service requests, and SLA monitoring
          </p>
        </div>
        {canCreate && (
          <Link
            href="/customer-service-operations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Inquiry
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{openInquiries}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{openComplaints}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="text-2xl font-bold text-gray-900">{activeRequests}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">SLA Breaches</p>
              <p className="text-2xl font-bold text-gray-900">{slaBreaches}</p>
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
              placeholder="Subject or customer name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="priority" className="mb-1 block text-xs font-medium text-gray-500">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_customer">Pending Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || priority || status) && (
          <Link href="/customer-service-operations" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Inquiries Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No inquiries found.</p>
          {canCreate && (
            <Link href="/customer-service-operations/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first inquiry
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Number</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Subject</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Channel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/customer-service-operations/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.inquiryNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.channel}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.priority === "urgent" ? "destructive" : t.priority === "high" ? "destructive" : "secondary"}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "resolved" ? "success" : t.status === "closed" ? "secondary" : "default"}>
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
