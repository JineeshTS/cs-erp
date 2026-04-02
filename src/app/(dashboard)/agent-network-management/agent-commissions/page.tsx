import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listAgentCommissions } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

export default async function AgentCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "anm:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const result = await listAgentCommissions({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Agent Commissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage agent commission calculations and payments
          </p>
        </div>
        {canCreate && (
          <Link
            href="/agent-network-management/agent-commissions/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Commission
          </Link>
        )}
      </div>

      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by commission ref or agent..."
            className="h-10 w-full rounded-md border border-input bg-background pe-4 ps-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Agent</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-end font-medium">Amount</th>
              <th className="px-4 py-3 text-start font-medium">Currency</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No agent commissions found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent-network-management/agent-commissions/${row.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.commissionRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.agentName ?? "\u2014"}</td>
                  <td className="px-4 py-3 capitalize">
                    {row.commissionType?.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {row.commissionAmount ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    {row.commissionCurrency ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.meta?.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/agent-network-management/agent-commissions?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(result.meta.cursor)}`}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
