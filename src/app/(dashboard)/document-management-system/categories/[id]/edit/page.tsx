import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsDocumentCategories } from "@/db/schema";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const CATEGORY_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:edit")))
    redirect("/document-management-system/categories");

  const { id } = await params;

  const category = await db
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
    .then((r) => r[0]);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/document-management-system/categories/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Category"
          apiPath={`/api/v1/document-management-system/categories/${id}`}
          fields={CATEGORY_FIELDS}
          initialData={{
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          }}
          isEdit
          returnPath={`/document-management-system/categories/${id}`}
        />
      </div>
    </div>
  );
}
