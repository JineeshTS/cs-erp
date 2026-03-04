import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listDeploymentOptimizers } from "@/lib/fleet-deployment-planning/service";
import { Badge } from "@/components/ui/badge";

export default async function DeploymentOptimizersListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:read")))
    redirect("/fleet-deployment-planning");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "fdp:create"
  );

  const { search = "", type = "" } = await searchParams;

  const result = await listDeploymentOptimizers({
    tenantId: session.tenantId,
    search: search || undefined,
    status: type || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deployment Optimizers
          </h1>
          <p className="text-sm text-gray-500">
            Manage fleet optimization scenarios and recommendations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/fleet-deployment-planning/deployment-optimizers/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Optimizer
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search optimizers..."
                defaultValue={search}
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            defaultValue={type}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="profit_maximization">Profit Maximization</option>
            <option value="cost_minimization">Cost Minimization</option>
            <option value="utilization_optimization">
              Utilization Optimization
            </option>
            <option value="emission_reduction">Emission Reduction</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>
      </div>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No deployment optimizers found.</p>
          {canCreate && (
            <Link
              href="/fleet-deployment-planning/deployment-optimizers/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first optimizer
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
                  Title
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Scenario
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Improvement %
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((optimizer) => (
                <tr
                  key={optimizer.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/fleet-deployment-planning/deployment-optimizers/${optimizer.id}`}
                      className="hover:underline"
                    >
                      {optimizer.optimizerRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <Link
                      href={`/fleet-deployment-planning/deployment-optimizers/${optimizer.id}`}
                      className="hover:underline"
                    >
                      {optimizer.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <Badge variant="secondary">{optimizer.optimizerType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {optimizer.scenarioName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {optimizer.improvementPct}%
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {optimizer.status}
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
