import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const MODULE_CONFIG_FIELDS: FieldConfig[] = [
  { name: "moduleSlug", label: "Module Slug", type: "text", required: true },
  { name: "moduleName", label: "Module Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isEnabled", label: "Enabled", type: "checkbox" },
];

export default async function NewModuleConfigPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "admin:create"))
  )
    redirect("/admin-portal/module-configs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/module-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Module Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Module Config"
          apiPath="/api/v1/admin-portal/module-configs"
          fields={MODULE_CONFIG_FIELDS}
          returnPath="/admin-portal/module-configs"
        />
      </div>
    </div>
  );
}
