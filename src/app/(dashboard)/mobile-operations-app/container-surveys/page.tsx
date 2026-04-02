import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listContainerSurveys } from "@/lib/mobile-operations-app/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  reviewed: "success",
  rejected: "destructive",
} as const;

export default async function ContainerSurveysListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/mobile-operations-app");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "mob:create"
  );

  const sp = await searchParams;
  const search = sp.search || "";
  const cursor = sp.cursor;

  const { data } = await listContainerSurveys({
    tenantId: session.tenantId,
    search: search || undefined,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Container Surveys
          </h1>
          <p className="text-sm text-gray-500">
            Manage mobile container survey inspections
          </p>
        </div>
        {canCreate && (
          <Link
            href="/mobile-operations-app/container-surveys/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Container Survey
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Search by survey ref or container number..."
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
          <p className="text-gray-500">No container surveys found.</p>
          {canCreate && (
            <Link
              href="/mobile-operations-app/container-surveys/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first container survey
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
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Condition
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Damages
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr
                  key={record.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/mobile-operations-app/container-surveys/${record.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {record.surveyRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.containerNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.surveyType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.containerCondition || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.damageCount ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          record.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {record.status}
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
