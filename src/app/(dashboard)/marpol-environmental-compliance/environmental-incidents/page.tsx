import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { listEnvironmentalIncidents } from "@/lib/marpol-environmental-compliance/service";

export default async function EnvironmentalIncidentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:read")))
    redirect("/");

  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const cursor = params.cursor || undefined;
  const limit = 50;

  const { data, meta } = await listEnvironmentalIncidents({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Environmental Incidents</h1>
        <Link
          href="/marpol-environmental-compliance/environmental-incidents/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Environmental Incident
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Incident Type</th>
              <th className="px-4 py-3 text-start font-medium">Vessel Name</th>
              <th className="px-4 py-3 text-start font-medium">Severity</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No environmental incidents found.
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/marpol-environmental-compliance/environmental-incidents/${row.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {row.incidentRef || "\u2014"}
                  </Link>
                </td>
                <td className="px-4 py-3">{row.title || "\u2014"}</td>
                <td className="px-4 py-3">{row.incidentType || "\u2014"}</td>
                <td className="px-4 py-3">{row.vesselName || "\u2014"}</td>
                <td className="px-4 py-3">{row.severity || "\u2014"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{row.status || "\u2014"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        {meta.hasMore && meta.cursor && (
          <Link
            href={`/marpol-environmental-compliance/environmental-incidents?cursor=${meta.cursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
