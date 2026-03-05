import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listReturnIncentives } from "@/lib/empty-container-repositioning-ai/service";

export default async function ReturnIncentivesListPage({
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

  const { data: records, meta } = await listReturnIncentives({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor,
    limit: 25,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Return Incentives
          </h1>
          <p className="text-muted-foreground">
            Manage return incentive programs for empty container repositioning.
          </p>
        </div>
        <Link
          href="/empty-container-repositioning-ai/return-incentives/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Return Incentive
        </Link>
      </div>

      <form method="get" className="flex items-center gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search incentives..."
          defaultValue={search}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-64"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80"
        >
          Filter
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">
                Incentive Ref
              </th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Customer</th>
              <th className="px-4 py-3 text-end font-medium">Value</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">
                      No return incentives found.
                    </p>
                    <Link
                      href="/empty-container-repositioning-ai/return-incentives/new"
                      className="text-sm text-primary hover:underline"
                    >
                      Create your first return incentive
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/empty-container-repositioning-ai/return-incentives/${record.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {record.incentiveRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{record.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      {record.incentiveType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">{record.customerName ?? "—"}</td>
                    <td className="px-4 py-3 text-end">
                      {record.incentiveValue}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          record.status === "active"
                            ? "default"
                            : record.status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {meta.hasMore && (
        <div className="flex justify-end">
          <Link
            href={`/empty-container-repositioning-ai/return-incentives?cursor=${meta.cursor}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
