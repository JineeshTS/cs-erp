import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsDocumentCategories } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CategoriesListPage() {
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
    .from(dmsDocumentCategories)
    .where(
      and(
        eq(dmsDocumentCategories.tenantId, session.tenantId),
        isNull(dmsDocumentCategories.deletedAt)
      )
    )
    .orderBy(desc(dmsDocumentCategories.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Categories
          </h1>
          <p className="text-sm text-gray-500">
            Manage document classification categories
          </p>
        </div>
        {canCreate && (
          <Link
            href="/document-management-system/categories/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Category
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No categories found.</p>
          {canCreate && (
            <Link
              href="/document-management-system/categories/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first category
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
                  Slug
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sort Order
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
              {data.map((category) => (
                <tr
                  key={category.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/categories/${category.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{category.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {category.sortOrder}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={category.isActive ? "success" : "secondary"}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {category.createdAt.toLocaleDateString()}
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
