import Link from "next/link";
import { Plus, GitBranch, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listCollectionWorkflows } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CollectionWorkflowsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "receivable:create");

  const sp = await searchParams;
  const result = await listCollectionWorkflows({
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
          <h1 className="text-2xl font-bold text-gray-900">Collection Workflows</h1>
          <p className="text-sm text-gray-500">Manage collection and escalation workflows</p>
        </div>
        {canCreate && (
          <Link href="/accounts-receivable-credit-control/collection-workflows/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Workflow
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={sp.search ?? ""} placeholder="Customer, workflow ref..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {sp.search && <Link href="/accounts-receivable-credit-control/collection-workflows" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <GitBranch className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No collection workflows found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Workflow Ref</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Outstanding</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Overdue</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Escalation Level</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Escalation Type</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Next Action</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {result.data.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><Link href={`/accounts-receivable-credit-control/collection-workflows/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.workflowRef}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalOutstanding?.toLocaleString() ?? "0"}</td>
                  <td className="px-4 py-3 text-red-600">{t.totalOverdue?.toLocaleString() ?? "0"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.escalationLevel ?? "--"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.escalationType ?? "--"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.nextActionDate ? new Date(t.nextActionDate).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3"><Badge variant={t.status === "active" ? "success" : t.status === "closed" ? "secondary" : "default"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={`/accounts-receivable-credit-control/collection-workflows?cursor=${result.meta.cursor}${sp.search ? `&search=${sp.search}` : ""}${sp.status ? `&status=${sp.status}` : ""}`} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
