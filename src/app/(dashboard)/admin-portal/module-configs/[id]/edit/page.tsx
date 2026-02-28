import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminModuleConfigs } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const MODULE_CONFIG_FIELDS: FieldConfig[] = [
  { name: "moduleSlug", label: "Module Slug", type: "text", required: true },
  { name: "moduleName", label: "Module Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isEnabled", label: "Enabled", type: "checkbox" },
];

export default async function EditModuleConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/module-configs");

  const { id } = await params;

  const moduleConfig = await db
    .select()
    .from(adminModuleConfigs)
    .where(
      and(
        eq(adminModuleConfigs.id, id),
        eq(adminModuleConfigs.tenantId, session.tenantId),
        isNull(adminModuleConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!moduleConfig) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/module-configs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Module Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Module Config"
          apiPath={`/api/v1/admin-portal/module-configs/${id}`}
          fields={MODULE_CONFIG_FIELDS}
          initialData={{
            moduleSlug: moduleConfig.moduleSlug,
            moduleName: moduleConfig.moduleName,
            description: moduleConfig.description ?? "",
            sortOrder: moduleConfig.sortOrder,
            isEnabled: moduleConfig.isEnabled,
          }}
          isEdit
          returnPath={`/admin-portal/module-configs/${id}`}
        />
      </div>
    </div>
  );
}
