import { redirect } from "next/navigation";
import Link from "next/link";
import { Thermometer, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listReeferPtiSurveys } from "@/lib/survey-inspection-management/service";
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

export default async function ReeferPtiSurveysListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:read"))) redirect("/login");

  const params = await searchParams;
  const { data, meta } = await listReeferPtiSurveys({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Thermometer className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reefer PTI Surveys</h1>
            <p className="text-sm text-muted-foreground">
              Manage reefer pre-trip inspection surveys
            </p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "survey:create")) && (
          <Link
            href="/survey-inspection-management/reefer-pti-surveys/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Reefer PTI Survey
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="search"
          type="text"
          placeholder="Ref, container, depot..."
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
              <th className="px-4 py-3 text-start font-medium">Container</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Depot</th>
              <th className="px-4 py-3 text-start font-medium">Result</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No reefer PTI surveys found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/survey-inspection-management/reefer-pti-surveys/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.surveyRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.containerNumber}</td>
                <td className="px-4 py-3">{record.surveyType}</td>
                <td className="px-4 py-3">{record.depotName ?? "-"}</td>
                <td className="px-4 py-3">{record.overallResult ?? "-"}</td>
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
              pathname: "/survey-inspection-management/reefer-pti-surveys",
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
