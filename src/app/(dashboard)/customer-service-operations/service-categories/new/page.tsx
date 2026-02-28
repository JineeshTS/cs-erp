import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const CATEGORY_FIELDS: FieldConfig[] = [
  { name: "categoryCode", label: "Category Code", type: "text", required: true, placeholder: "CAT-001" },
  { name: "categoryName", label: "Category Name", type: "text", required: true, placeholder: "General Inquiries" },
  { name: "slaHours", label: "SLA Hours", type: "number", placeholder: "24" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "0" },
  { name: "description", label: "Description", type: "textarea" },
];

export default async function NewServiceCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations/service-categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/service-categories" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Service Category</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Service Category"
          apiPath="/api/v1/customer-service-operations/service-categories"
          fields={CATEGORY_FIELDS}
          returnPath="/customer-service-operations/service-categories"
        />
      </div>
    </div>
  );
}
