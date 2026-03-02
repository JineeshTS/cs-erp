import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPlacardRequirements } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PlacardRequirementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:create"
  );

  const sp = await searchParams;
  const cursor = sp.cursor;
  const search = sp.search;
  const status = sp.status;

  const { data: items, meta } = await listPlacardRequirements({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Placard Requirements
          </h1>
          <p className="text-sm text-gray-500">
            Manage dangerous goods placard and labeling requirements
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dangerous-goods-management/placard-requirements/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Placard Requirement
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Tag className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No placard requirements found.</p>
          {canCreate && (
            <Link
              href="/dangerous-goods-management/placard-requirements/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first placard requirement
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Placard Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  IMDG Class
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Placard Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Label Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Label Description
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((placard) => (
                <tr
                  key={placard.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dangerous-goods-management/placard-requirements/${placard.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {placard.placardRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {placard.imdgClass || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {placard.placardType
                      ? placard.placardType.replace(/_/g, " ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {placard.labelCode || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {placard.labelDescription || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        placard.status === "active"
                          ? "success"
                          : placard.status === "draft"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {placard.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/dangerous-goods-management/placard-requirements?cursor=${encodeURIComponent(meta.cursor)}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
