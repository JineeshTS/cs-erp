import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listLeasingDecisions } from "@/lib/empty-container-repositioning-ai/service";

export default async function LeasingDecisionsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const sp = await searchParams;
  const cursor = sp.cursor;
  const search = sp.search;
  const status = sp.status;

  const { data: decisions, meta } = await listLeasingDecisions({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leasing Decisions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage container leasing and repositioning decisions
          </p>
        </div>
        <Link
          href="/empty-container-repositioning-ai/leasing-decisions/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Decision
        </Link>
      </div>

      {decisions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No leasing decisions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new leasing decision.
          </p>
          <Link
            href="/empty-container-repositioning-ai/leasing-decisions/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Decision
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium">
                    Decision Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium">Title</th>
                  <th className="px-4 py-3 text-start font-medium">Type</th>
                  <th className="px-4 py-3 text-start font-medium">
                    Recommended Action
                  </th>
                  <th className="px-4 py-3 text-end font-medium">
                    Savings Amount
                  </th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                    <tr key={d.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/empty-container-repositioning-ai/leasing-decisions/${d.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {d.decisionRef}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{d.title ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{d.decisionType}</Badge>
                      </td>
                      <td className="px-4 py-3">{d.recommendedAction ?? "—"}</td>
                      <td className="px-4 py-3 text-end">
                        {d.savingsAmount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            d.status === "active" ? "default" : "secondary"
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {meta.hasMore && meta.cursor && (
            <div className="flex justify-center">
              <Link
                href={`/empty-container-repositioning-ai/leasing-decisions?cursor=${meta.cursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Load More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
