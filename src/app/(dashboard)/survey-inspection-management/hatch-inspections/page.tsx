import { redirect } from "next/navigation";
import Link from "next/link";
import { DoorOpen, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listHatchInspections } from "@/lib/survey-inspection-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function HatchInspectionsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const params = await searchParams;
  const { data, meta } = await listHatchInspections({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DoorOpen className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hatch Inspections</h1>
            <p className="text-sm text-muted-foreground">
              Manage hatch and hold inspection operations
            </p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:create")) && (
          <Link
            href="/survey-inspection-management/hatch-inspections/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Hatch Inspection
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="search"
          type="text"
          placeholder="Ref, vessel, hold..."
          defaultValue={params.search ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
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
              <th className="px-4 py-3 text-start font-medium">Vessel</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Hold</th>
              <th className="px-4 py-3 text-start font-medium">Fitness</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hatch inspections found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/survey-inspection-management/hatch-inspections/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.inspectionRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.vesselName}</td>
                <td className="px-4 py-3">{record.inspectionType}</td>
                <td className="px-4 py-3">{record.holdNumber}</td>
                <td className="px-4 py-3">{record.cargoFitness ?? "-"}</td>
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
              pathname: "/survey-inspection-management/hatch-inspections",
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
