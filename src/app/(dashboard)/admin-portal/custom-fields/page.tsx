import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { customFieldDefinitions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CustomFieldsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.tenantId, session.tenantId),
        isNull(customFieldDefinitions.deletedAt)
      )
    )
    .orderBy(desc(customFieldDefinitions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
          <p className="text-sm text-gray-500">
            Manage custom field definitions for all entity types
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/custom-fields/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Custom Field
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No custom field definitions found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/custom-fields/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first custom field
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Field Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Field Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Required
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((field) => (
                <tr
                  key={field.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/custom-fields/${field.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {field.fieldLabel}
                    </Link>
                    <div className="text-xs text-gray-400">{field.fieldName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {field.entityType}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{field.fieldType}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={field.isRequired ? "destructive" : "secondary"}>
                      {field.isRequired ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={field.isActive ? "success" : "secondary"}>
                      {field.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {field.createdAt.toLocaleDateString()}
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
