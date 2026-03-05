import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { lprEmergencyProcedures } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function EmergencyProceduresListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "lpr:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(lprEmergencyProcedures.tenantId, session.tenantId),
    isNull(lprEmergencyProcedures.deletedAt),
  ];
  if (status) conditions.push(eq(lprEmergencyProcedures.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(lprEmergencyProcedures.procedureRef, `%${search}%`),
        ilike(lprEmergencyProcedures.title, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(lprEmergencyProcedures.createdAt, new Date(cursor)));

  const data = await db.select().from(lprEmergencyProcedures)
    .where(and(...conditions))
    .orderBy(desc(lprEmergencyProcedures.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/loss-prevention-risk-management/emergency-procedures?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Procedures</h1>
          <p className="text-sm text-gray-500">Manage emergency response procedures and drill schedules</p>
        </div>
        {canCreate && (
          <Link href="/loss-prevention-risk-management/emergency-procedures/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Emergency Procedure
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Procedure ref, title..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/loss-prevention-risk-management/emergency-procedures" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No emergency procedures found.</p>
          {canCreate && (
            <Link href="/loss-prevention-risk-management/emergency-procedures/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first emergency procedure</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Procedure Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Drill Frequency</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/loss-prevention-risk-management/emergency-procedures/${r.id}`} className="font-medium text-gray-900 hover:underline">{r.procedureRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.title || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{r.procedureType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{r.vesselType || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.drillFrequency || "\u2014"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "active" ? "success" : r.status === "approved" ? "default" : "secondary"}>{r.status}</Badge>
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
