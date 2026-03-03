import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listTcfdReports } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "published":
    case "verified":
      return <Badge variant="success">{status}</Badge>;
    case "rejected":
      return <Badge variant="destructive">{status}</Badge>;
    case "submitted":
      return <Badge variant="warning">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function TcfdReportsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ser:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const cursor = sp.cursor ?? undefined;

  const { data, meta } = await listTcfdReports({
    tenantId: session.tenantId,
    search,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">TCFD Reports</h1>
          <p className="text-sm text-muted-foreground">
            Task Force on Climate-related Financial Disclosures reporting
          </p>
        </div>
        {canCreate && (
          <Link
            href="/sustainability-esg-reporting/tcfd-reports/new"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + New TCFD Report
          </Link>
        )}
      </div>

      <form method="GET" className="flex items-center gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by TCFD ref or title..."
          defaultValue={search}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No TCFD reports found.</p>
          {canCreate && (
            <Link
              href="/sustainability-esg-reporting/tcfd-reports/new"
              className="mt-4 text-sm text-primary underline"
            >
              Create your first TCFD report
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium">Ref</th>
                  <th className="px-4 py-3 text-start font-medium">Title</th>
                  <th className="px-4 py-3 text-start font-medium">Type</th>
                  <th className="px-4 py-3 text-start font-medium">Year</th>
                  <th className="px-4 py-3 text-start font-medium">Pillar</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/sustainability-esg-reporting/tcfd-reports/${row.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {row.tcfdRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {row.disclosureTitle ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">{row.tcfdType}</td>
                    <td className="px-4 py-3">
                      {row.reportingYear ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      {row.pillarArea ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {data.length} record{data.length !== 1 ? "s" : ""}
            </p>
            {meta?.cursor && (
              <Link
                href={`/sustainability-esg-reporting/tcfd-reports?search=${encodeURIComponent(search)}&cursor=${encodeURIComponent(meta.cursor)}`}
                className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Next Page
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
