import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminFeatureConfigs } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const FEATURE_CONFIG_FIELDS: FieldConfig[] = [
  {
    name: "moduleConfigId",
    label: "Module Config ID",
    type: "text",
    required: true,
    placeholder: "Module Config UUID",
  },
  { name: "featureSlug", label: "Feature Slug", type: "text", required: true },
  {
    name: "featureName",
    label: "Feature Name",
    type: "text",
    required: true,
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isEnabled", label: "Enabled", type: "checkbox" },
];

export default async function EditFeatureConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/feature-configs");

  const { id } = await params;

  const featureConfig = await db
    .select()
    .from(adminFeatureConfigs)
    .where(
      and(
        eq(adminFeatureConfigs.id, id),
        eq(adminFeatureConfigs.tenantId, session.tenantId),
        isNull(adminFeatureConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!featureConfig) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/feature-configs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Feature Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Feature Config"
          apiPath={`/api/v1/admin-portal/feature-configs/${id}`}
          fields={FEATURE_CONFIG_FIELDS}
          initialData={{
            moduleConfigId: featureConfig.moduleConfigId,
            featureSlug: featureConfig.featureSlug,
            featureName: featureConfig.featureName,
            description: featureConfig.description ?? "",
            isEnabled: featureConfig.isEnabled,
          }}
          isEdit
          returnPath={`/admin-portal/feature-configs/${id}`}
        />
      </div>
    </div>
  );
}
