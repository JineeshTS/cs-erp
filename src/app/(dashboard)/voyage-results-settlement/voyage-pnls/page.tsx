import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listVoyagePnls } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "verified":
      return "success";
    case "published":
      return "default";
    default:
      return "secondary";
  }
}

export default async function VoyagePnlsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/login");

  const params = await searchParams;
  const { data, meta } = await listVoyagePnls({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Voyage P&L Statements</h1>
            <p className="text-sm text-muted-foreground">
              Manage voyage profit and loss statements
            </p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "vrs:create")) && (
          <Link
            href="/voyage-results-settlement/voyage-pnls/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New P&L
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
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="verified">Verified</option>
          <option value="published">Published</option>
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
              <th className="px-4 py-3 text-start font-medium">Voyage Number</th>
              <th className="px-4 py-3 text-start font-medium">Net P&L</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No voyage P&L statements found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/voyage-results-settlement/voyage-pnls/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.pnlRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.title ?? "-"}</td>
                <td className="px-4 py-3 capitalize">{record.pnlType?.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">{record.voyageNumber ?? "-"}</td>
                <td className="px-4 py-3">
                  {record.netPnl !== null && record.netPnl !== undefined
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(record.netPnl))
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
              pathname: "/voyage-results-settlement/voyage-pnls",
              query: {
                cursor: meta.cursor,
                ...(params.search ? { search: params.search } : {}),
                ...(params.status ? { status: params.status } : {}),
              },
            }}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
