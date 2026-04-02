import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listNetworkDesigns } from "@/lib/fleet-deployment-planning/service";
import { Badge } from "@/components/ui/badge";

export default async function NetworkDesignsListPage({
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

  const { data, meta } = await listNetworkDesigns({
    tenantId: session.tenantId,
    search: search || undefined,
    status: (type || undefined) as string | undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Network Designs
          </h1>
          <p className="text-sm text-gray-500">
            Manage container shipping network configurations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/fleet-deployment-planning/network-designs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Design
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
                placeholder="Search designs..."
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
            <option value="hub_spoke">Hub & Spoke</option>
            <option value="direct_service">Direct Service</option>
            <option value="pendulum">Pendulum</option>
            <option value="round_trip">Round Trip</option>
            <option value="relay">Relay</option>
          </select>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No network designs found.</p>
          {canCreate && (
            <Link
              href="/fleet-deployment-planning/network-designs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first design
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
                  Service
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessels
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((design: any) => (
                <tr
                  key={design.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/fleet-deployment-planning/network-designs/${design.id}`}
                      className="hover:underline"
                    >
                      {design.networkRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <Link
                      href={`/fleet-deployment-planning/network-designs/${design.id}`}
                      className="hover:underline"
                    >
                      {design.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <Badge variant="secondary">{design.networkType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {design.serviceName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {design.vesselCount}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{design.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
