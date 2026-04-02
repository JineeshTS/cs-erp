import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const CATEGORY_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "documents:create"))
  )
    redirect("/document-management-system/categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/categories"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Category"
          apiPath="/api/v1/document-management-system/categories"
          fields={CATEGORY_FIELDS}
          returnPath="/document-management-system/categories"
        />
      </div>
    </div>
  );
}
