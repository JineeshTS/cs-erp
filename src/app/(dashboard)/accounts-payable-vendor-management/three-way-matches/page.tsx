import Link from "next/link";
import { Plus, CheckSquare, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listThreeWayMatches } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ThreeWayMatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "payable:create");

  const sp = await searchParams;
  const result = await listThreeWayMatches({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Three-Way Matches</h1>
          <p className="text-sm text-gray-500">PO, GR, and invoice matching verification</p>
        </div>
        {canCreate && (
          <Link
            href="/accounts-payable-vendor-management/three-way-matches/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Match
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={sp.search ?? ""}
              placeholder="Match ref, vendor name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
            <option value="exception">Exception</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(sp.search || sp.status) && (
          <Link href="/accounts-payable-vendor-management/three-way-matches" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <CheckSquare className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No three-way matches found.</p>
          {canCreate && (
            <Link href="/accounts-payable-vendor-management/three-way-matches/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first match</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Match Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vendor Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">PO Amount</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Invoice Amount</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Within Tolerance</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/accounts-payable-vendor-management/three-way-matches/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.matchRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vendorName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.poAmount?.toLocaleString() ?? "0"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.invoiceAmount?.toLocaleString() ?? "0"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.withinTolerance ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "matched" ? "success" : t.status === "pending" ? "secondary" : "destructive"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={`/accounts-payable-vendor-management/three-way-matches?cursor=${result.meta.cursor}${sp.search ? `&search=${sp.search}` : ""}${sp.status ? `&status=${sp.status}` : ""}`} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
