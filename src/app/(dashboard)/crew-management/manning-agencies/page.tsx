import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listManningAgencies } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">{status}</Badge>;
    case "terminated":
    case "suspended":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function ManningAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? undefined;

  const { data, meta } = await listManningAgencies({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manning Agencies</h1>
        <Link
          href="/crew-management/manning-agencies/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Manning Agency
        </Link>
      </div>

      <form method="GET" className="flex items-center gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by ref, agency name…"
          defaultValue={search}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="terminated">Terminated</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Filter
        </button>
      </form>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No manning agencies found.</p>
          <Link
            href="/crew-management/manning-agencies/new"
            className="mt-4 text-sm text-primary underline"
          >
            Create your first manning agency
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-start font-medium">Ref</th>
                  <th className="px-4 py-3 text-start font-medium">
                    Agency Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium">Country</th>
                  <th className="px-4 py-3 text-start font-medium">
                    Active Crew
                  </th>
                  <th className="px-4 py-3 text-start font-medium">Rating</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/crew-management/manning-agencies/${row.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {row.agencyRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{row.agencyName}</td>
                    <td className="px-4 py-3">{row.country}</td>
                    <td className="px-4 py-3">{row.activeCrewCount}</td>
                    <td className="px-4 py-3">{row.performanceRating}</td>
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
                href={`/crew-management/manning-agencies?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(meta.cursor)}`}
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
