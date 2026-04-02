import Link from "next/link";
import { Plus, ClipboardList, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listAgentStatements } from "@/lib/port-disbursement-accounting/service";
import { Badge } from "@/components/ui/badge";

export default async function AgentStatementsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:read")))
    redirect("/port-disbursement-accounting");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "disbursement:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data, meta } = await listAgentStatements({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/port-disbursement-accounting/agent-statements?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agent Statements
          </h1>
          <p className="text-sm text-gray-500">
            Manage agent account statements and reconciliation
          </p>
        </div>
        {canCreate && (
          <Link
            href="/port-disbursement-accounting/agent-statements/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Agent Statement
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
              placeholder="Statement ref, agent name..."
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
            <option value="draft">Draft</option>
            <option value="reconciled">Reconciled</option>
            <option value="disputed">Disputed</option>
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
            href="/port-disbursement-accounting/agent-statements"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No agent statements found.</p>
          {canCreate && (
            <Link
              href="/port-disbursement-accounting/agent-statements/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first agent statement
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Statement Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Agent Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Closing Balance
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Balance Due
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Statement Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr
                  key={record.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/port-disbursement-accounting/agent-statements/${record.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {record.statementRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.agentName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.closingBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.balanceDue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.statementDate
                      ? new Date(record.statementDate).toLocaleString()
                      : "--"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        record.status === "reconciled"
                          ? "success"
                          : record.status === "disputed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(meta.cursor)}
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
