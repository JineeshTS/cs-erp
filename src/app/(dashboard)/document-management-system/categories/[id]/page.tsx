import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsDocumentCategories, dmsDocuments } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const [category, children, documents] = await Promise.all([
    db
      .select()
      .from(dmsDocumentCategories)
      .where(
        and(
          eq(dmsDocumentCategories.id, id),
          eq(dmsDocumentCategories.tenantId, session.tenantId),
          isNull(dmsDocumentCategories.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(dmsDocumentCategories)
      .where(
        and(
          eq(dmsDocumentCategories.parentId, id),
          eq(dmsDocumentCategories.tenantId, session.tenantId),
          isNull(dmsDocumentCategories.deletedAt)
        )
      )
      .orderBy(desc(dmsDocumentCategories.createdAt)),
    db
      .select()
      .from(dmsDocuments)
      .where(
        and(
          eq(dmsDocuments.categoryId, id),
          eq(dmsDocuments.tenantId, session.tenantId),
          isNull(dmsDocuments.deletedAt)
        )
      )
      .orderBy(desc(dmsDocuments.createdAt)),
  ]);

  if (!category) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "documents:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/categories"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-500">{category.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/document-management-system/categories/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{category.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{category.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sort Order</dt>
            <dd className="mt-1 text-gray-900">{category.sortOrder}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge
                variant={category.isActive ? "success" : "secondary"}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Parent ID</dt>
            <dd className="mt-1 text-gray-900">
              {category.parentId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {category.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {category.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {category.description || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Child Categories ({children.length})
        </h2>
        {children.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No child categories.</p>
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
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr
                    key={child.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/document-management-system/categories/${child.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {child.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{child.slug}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={child.isActive ? "success" : "secondary"}
                      >
                        {child.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No documents in this category.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Document Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {doc.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.documentType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.status}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
