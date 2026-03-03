import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPerformanceKpis } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  completed: "success",
  pending: "warning",
  cancelled: "destructive",
} as const;

export default async function PerformanceKpisListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/agent-network-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "anm:create"
  );

  const sp = await searchParams;
  const search = sp.search || "";

  const { data } = await listPerformanceKpis({
    tenantId: session.tenantId,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance KPIs
          </h1>
          <p className="text-sm text-gray-500">
            Manage agent performance KPI targets and achievements
          </p>
        </div>
        {canCreate && (
          <Link
            href="/agent-network-management/performance-kpis/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Performance KPI
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Search by KPI ref or agent..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No performance KPIs found.</p>
          {canCreate && (
            <Link
              href="/agent-network-management/performance-kpis/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first performance KPI
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Agent
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Period
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Achievement
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((kpi) => (
                <tr
                  key={kpi.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent-network-management/performance-kpis/${kpi.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {kpi.kpiRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {kpi.agentName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{kpi.kpiType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {kpi.kpiPeriod || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {kpi.achievementPct ? `${kpi.achievementPct}%` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          kpi.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {kpi.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
