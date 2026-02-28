import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminMasterDataConfigs } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const MASTER_DATA_CONFIG_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "text", required: true },
  { name: "entityName", label: "Entity Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isLocked", label: "Locked", type: "checkbox" },
];

export default async function EditMasterDataConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/master-data-configs");

  const { id } = await params;

  const config = await db
    .select()
    .from(adminMasterDataConfigs)
    .where(
      and(
        eq(adminMasterDataConfigs.id, id),
        eq(adminMasterDataConfigs.tenantId, session.tenantId),
        isNull(adminMasterDataConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!config) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/master-data-configs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Master Data Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Master Data Config"
          apiPath={`/api/v1/admin-portal/master-data-configs/${id}`}
          fields={MASTER_DATA_CONFIG_FIELDS}
          initialData={{
            entityType: config.entityType,
            entityName: config.entityName,
            description: config.description ?? "",
            isLocked: config.isLocked,
          }}
          isEdit
          returnPath={`/admin-portal/master-data-configs/${id}`}
        />
      </div>
    </div>
  );
}
