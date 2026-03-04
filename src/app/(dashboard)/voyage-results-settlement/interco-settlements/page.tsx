import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listIntercoSettlements } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "pending":
      return "warning";
    case "settled":
      return "success";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function IntercoSettlementsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; intercoType?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");

  const params = await searchParams;
  const { data, meta } = await listIntercoSettlements({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  const canCreate = await hasPermission(session.id, session.tenantId, "vrs:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interco Settlements</h1>
            <p className="text-sm text-muted-foreground">
              Manage inter-company settlements and cost sharing
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/voyage-results-settlement/interco-settlements/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Settlement
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="search"
          type="text"
          placeholder="Search ref or title..."
          defaultValue={params.search ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          name="intercoType"
          defaultValue={params.intercoType ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="cost_sharing">Cost Sharing</option>
          <option value="revenue_sharing">Revenue Sharing</option>
          <option value="management_fee">Management Fee</option>
          <option value="bunker_allocation">Bunker Allocation</option>
          <option value="overhead_allocation">Overhead Allocation</option>
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="settled">Settled</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Search
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">From</th>
              <th className="px-4 py-3 text-start font-medium">To</th>
              <th className="px-4 py-3 text-start font-medium">Amount</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No settlements found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/voyage-results-settlement/interco-settlements/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.intercoRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.title}</td>
                <td className="px-4 py-3">{record.intercoType.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">{record.fromEntity ?? "-"}</td>
                <td className="px-4 py-3">{record.toEntity ?? "-"}</td>
                <td className="px-4 py-3">
                  {record.settlementAmount !== null
                    ? `${record.currency ?? "USD"} ${record.settlementAmount}`
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        {meta.hasMore && meta.cursor && (
          <Link
            href={{
              pathname: "/voyage-results-settlement/interco-settlements",
              query: {
                cursor: meta.cursor,
                ...(params.search ? { search: params.search } : {}),
                ...(params.intercoType ? { intercoType: params.intercoType } : {}),
                ...(params.status ? { status: params.status } : {}),
              },
            }}
            className="text-sm text-primary hover:underline"
          >
            Load more
          </Link>
        )}
      </div>
    </div>
  );
}
