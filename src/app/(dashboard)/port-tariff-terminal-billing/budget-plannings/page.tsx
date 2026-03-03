import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listBudgetPlannings } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function BudgetPlanningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const result = await listBudgetPlannings({
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
            Budget Plannings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage port budget planning and control
          </p>
        </div>
        {canCreate && (
          <Link
            href="/port-tariff-terminal-billing/budget-plannings/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Budget Planning
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
            placeholder="Search by budget ref or port name..."
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
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
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
              <th className="px-4 py-3 text-start font-medium">Port</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-end font-medium">Budgeted</th>
              <th className="px-4 py-3 text-end font-medium">Variance</th>
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
                      No budget plannings found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              result.data.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/port-tariff-terminal-billing/budget-plannings/${row.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.budgetRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.portName ?? "\u2014"}</td>
                  <td className="px-4 py-3 capitalize">
                    {row.budgetType?.replace(/_/g, " ") ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {row.budgetedAmount ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {row.varianceAmount ?? "\u2014"}
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
            href={`/port-tariff-terminal-billing/budget-plannings?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(result.meta.cursor)}`}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
