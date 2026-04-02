import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listRouteOptimizers } from "@/lib/empty-container-repositioning-ai/service";

export default async function RouteOptimizersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? undefined;

  const { data: routeOptimizers, meta } = await listRouteOptimizers({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor,
    limit: 25,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Route Optimizers
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered route optimization for empty container repositioning
          </p>
        </div>
        <Link
          href="/empty-container-repositioning-ai/route-optimizers/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Route Optimizer
        </Link>
      </div>

      <form method="get" className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search route optimizers..."
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
          className="inline-flex h-10 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Filter
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Optimizer Ref
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Optimizer Type
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Scenario Name
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Total Savings
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {routeOptimizers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No route optimizers found. Create your first one to get
                  started.
                </td>
              </tr>
            ) : (
              routeOptimizers.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.optimizerRef}
                    </td>
                    <td className="px-4 py-3">{item.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {item.optimizerType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{item.scenarioName ?? "—"}</td>
                    <td className="px-4 py-3 font-mono">
                      {item.totalSavings}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.status === "active" ||
                          item.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        href={`/empty-container-repositioning-ai/route-optimizers/${item.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {meta.hasMore && (
        <div className="flex justify-center">
          <Link
            href={`/empty-container-repositioning-ai/route-optimizers?cursor=${meta.cursor}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
            className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
