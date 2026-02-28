import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsRetentionPolicies } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function RetentionPoliciesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "documents:create"
  );

  const data = await db
    .select()
    .from(dmsRetentionPolicies)
    .where(
      and(
        eq(dmsRetentionPolicies.tenantId, session.tenantId),
        isNull(dmsRetentionPolicies.deletedAt)
      )
    )
    .orderBy(desc(dmsRetentionPolicies.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Retention Policies
          </h1>
          <p className="text-sm text-gray-500">
            Manage document retention and archive policies
          </p>
        </div>
        {canCreate && (
          <Link
            href="/document-management-system/retention-policies/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Policy
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No retention policies found.</p>
          {canCreate && (
            <Link
              href="/document-management-system/retention-policies/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first retention policy
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Document Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Retention Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Archive After Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Auto Archive
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Auto Delete
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((policy) => (
                <tr
                  key={policy.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/retention-policies/${policy.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {policy.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {policy.documentType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {policy.retentionDays}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {policy.archiveAfterDays ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={policy.autoArchive ? "success" : "secondary"}
                    >
                      {policy.autoArchive ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={policy.autoDelete ? "destructive" : "secondary"}
                    >
                      {policy.autoDelete ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={policy.isActive ? "success" : "secondary"}
                    >
                      {policy.isActive ? "Active" : "Inactive"}
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
