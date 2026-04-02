import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listFreeTimeRules } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "success",
  draft: "secondary",
  expired: "destructive",
};

export default async function FreeTimeRulesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { search, status, cursor } = await searchParams;

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:create"
  );

  const { data, meta } = await listFreeTimeRules({
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
          <h1 className="text-2xl font-bold text-gray-900">Free Time Rules</h1>
          <p className="text-sm text-gray-500">
            Manage free time allowance rules for demurrage and detention
          </p>
        </div>
        {canCreate && (
          <Link
            href="/demurrage-detention-management/free-time-rules/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No free time rules found.</p>
          {canCreate && (
            <Link
              href="/demurrage-detention-management/free-time-rules/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first free time rule
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
                  Rule Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Applicable To
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Free Time Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demurrage-detention-management/free-time-rules/${rule.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rule.ruleRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.ruleName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.ruleType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.applicableTo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.freeTimeDays}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[rule.status] ?? "secondary"}>
                      {rule.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && meta.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/demurrage-detention-management/free-time-rules?cursor=${encodeURIComponent(meta.cursor)}${status ? `&status=${encodeURIComponent(status)}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
