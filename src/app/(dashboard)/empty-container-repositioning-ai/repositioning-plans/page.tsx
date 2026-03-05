import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listRepositioningPlans } from "@/lib/empty-container-repositioning-ai/service";

export default async function RepositioningPlansListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const cursor = params.cursor ?? undefined;

  const { data: plans, meta } = await listRepositioningPlans({
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
            Repositioning Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage container repositioning and movement plans
          </p>
        </div>
        <Link
          href="/empty-container-repositioning-ai/repositioning-plans/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </Link>
      </div>

      <form method="get" className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Search plans..."
            defaultValue={search}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-secondary px-4 text-sm font-medium hover:bg-secondary/80"
        >
          Filter
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Origin</th>
              <th className="px-4 py-3 text-start font-medium">Destination</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No repositioning plans found.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/empty-container-repositioning-ai/repositioning-plans/${plan.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {plan.planRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{plan.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{plan.planType}</Badge>
                  </td>
                  <td className="px-4 py-3">{plan.originPort}</td>
                  <td className="px-4 py-3">{plan.destinationPort}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        plan.status === "active"
                          ? "default"
                          : plan.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {plan.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        {cursor && (
          <Link
            href="/empty-container-repositioning-ai/repositioning-plans"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            First Page
          </Link>
        )}
        {meta.hasMore && meta.cursor && (
          <Link
            href={`/empty-container-repositioning-ai/repositioning-plans?cursor=${meta.cursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
