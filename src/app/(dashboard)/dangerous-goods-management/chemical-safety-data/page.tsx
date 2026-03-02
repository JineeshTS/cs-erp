import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listChemicalSafetyData } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ChemicalSafetyDataListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { search, status, cursor } = await searchParams;

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:create"
  );

  const { data, meta } = await listChemicalSafetyData({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  const statusVariant = (s: string) => {
    switch (s) {
      case "active":
        return "success";
      case "draft":
        return "secondary";
      case "expired":
        return "destructive";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chemical Safety Data
          </h1>
          <p className="text-sm text-gray-500">
            Manage safety data sheets and chemical information
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dangerous-goods-management/chemical-safety-data/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Record
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No chemical safety data records found.</p>
          {canCreate && (
            <Link
              href="/dangerous-goods-management/chemical-safety-data/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first record
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Reference
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Chemical Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  CAS Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  UN Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  IMDG Class
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
                      href={`/dangerous-goods-management/chemical-safety-data/${record.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {record.safetyDataRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.chemicalName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.casNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.unNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.imdgClass || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && (
        <div className="flex justify-center">
          <Link
            href={`/dangerous-goods-management/chemical-safety-data?cursor=${meta.cursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
