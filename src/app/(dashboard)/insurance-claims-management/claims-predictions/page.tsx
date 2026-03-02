import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listClaimsPredictions } from "@/lib/insurance-claims-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function ClaimsPredictionsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const params = await searchParams;
  const { data, meta } = await listClaimsPredictions({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Claims Predictions</h1>
            <p className="text-sm text-muted-foreground">
              Manage AI-driven claims prediction & prevention
            </p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:create")) && (
          <Link
            href="/insurance-claims-management/claims-predictions/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Prediction
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="search"
          type="text"
          placeholder="Ref, vessel, type..."
          defaultValue={params.search ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
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
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Vessel</th>
              <th className="px-4 py-3 text-start font-medium">Risk</th>
              <th className="px-4 py-3 text-start font-medium">Score</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No claims predictions found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/insurance-claims-management/claims-predictions/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.predictionRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.predictionType}</td>
                <td className="px-4 py-3">{record.vesselName}</td>
                <td className="px-4 py-3">{record.riskLevel}</td>
                <td className="px-4 py-3">{record.riskScore}</td>
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
              pathname: "/insurance-claims-management/claims-predictions",
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
