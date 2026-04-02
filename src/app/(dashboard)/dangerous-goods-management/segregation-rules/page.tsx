import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listSegregationRules } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function SegregationRulesPage({
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

  const { data: items, meta } = await listSegregationRules({
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
            Segregation Rules
          </h1>
          <p className="text-sm text-gray-500">
            Manage IMDG segregation rules for dangerous goods stowage
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dangerous-goods-management/segregation-rules/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Segregation Rule
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No segregation rules found.</p>
          {canCreate && (
            <Link
              href="/dangerous-goods-management/segregation-rules/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first segregation rule
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rule Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rule Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Source Class
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Target Class
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Segregation Level
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dangerous-goods-management/segregation-rules/${rule.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rule.ruleRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.ruleName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.sourceClass || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.targetClass || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.segregationLevel
                      ? rule.segregationLevel.replace(/_/g, " ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        rule.status === "active"
                          ? "success"
                          : rule.status === "draft"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {rule.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/dangerous-goods-management/segregation-rules?cursor=${encodeURIComponent(meta.cursor)}`}
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
