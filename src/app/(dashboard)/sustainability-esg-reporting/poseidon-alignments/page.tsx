import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPoseidonAlignments } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function PoseidonAlignmentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const sp = await searchParams;

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ser:create"
  );

  const { data } = await listPoseidonAlignments({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Poseidon Alignments
          </h1>
          <p className="text-sm text-gray-500">
            Manage POSEIDON Principles alignment records
          </p>
        </div>
        {canCreate && (
          <Link
            href="/sustainability-esg-reporting/poseidon-alignments/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Poseidon Alignment
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No poseidon alignments found.</p>
          {canCreate && (
            <Link
              href="/sustainability-esg-reporting/poseidon-alignments/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first poseidon alignment
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
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Year
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Aligned
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((alignment) => (
                <tr
                  key={alignment.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/sustainability-esg-reporting/poseidon-alignments/${alignment.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {alignment.alignmentRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alignment.vesselName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alignment.alignmentType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alignment.reportingYear}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        alignment.climateAligned ? "success" : "secondary"
                      }
                    >
                      {alignment.climateAligned ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        alignment.status === "active"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {alignment.status}
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
