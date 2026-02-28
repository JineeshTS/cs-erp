import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoServiceCategories } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const CATEGORY_FIELDS: FieldConfig[] = [
  { name: "categoryCode", label: "Category Code", type: "text", required: true },
  { name: "categoryName", label: "Category Name", type: "text", required: true },
  { name: "slaHours", label: "SLA Hours", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
];

export default async function EditServiceCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/service-categories");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoServiceCategories)
    .where(
      and(
        eq(csoServiceCategories.id, id),
        eq(csoServiceCategories.tenantId, session.tenantId),
        isNull(csoServiceCategories.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    categoryCode: record.categoryCode,
    categoryName: record.categoryName,
    slaHours: record.slaHours ?? "",
    isActive: record.isActive,
    sortOrder: record.sortOrder ?? 0,
    description: record.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/service-categories/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Service Category</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Service Category"
          apiPath={`/api/v1/customer-service-operations/service-categories/${id}`}
          fields={CATEGORY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/service-categories/${id}`}
        />
      </div>
    </div>
  );
}
