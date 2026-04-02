import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminFeatureFlags } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const FEATURE_FLAG_FIELDS: FieldConfig[] = [
  { name: "flagKey", label: "Flag Key", type: "text", required: true },
  { name: "flagName", label: "Flag Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isEnabled", label: "Enabled", type: "checkbox" },
  { name: "rolloutPercentage", label: "Rollout Percentage", type: "number" },
  { name: "expiresAt", label: "Expires At", type: "date" },
];

export default async function EditFeatureFlagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/feature-flags");

  const [flag] = await db
    .select()
    .from(adminFeatureFlags)
    .where(
      and(
        eq(adminFeatureFlags.id, id),
        eq(adminFeatureFlags.tenantId, session.tenantId),
        isNull(adminFeatureFlags.deletedAt)
      )
    )
    .limit(1);

  if (!flag) notFound();

  const initialData: Record<string, unknown> = {
    flagKey: flag.flagKey,
    flagName: flag.flagName,
    description: flag.description ?? "",
    isEnabled: flag.isEnabled,
    rolloutPercentage: flag.rolloutPercentage,
    expiresAt: flag.expiresAt
      ? flag.expiresAt.toISOString().slice(0, 10)
      : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/feature-flags/${flag.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Feature Flag
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Feature Flag"
          apiPath={`/api/v1/admin-portal/feature-flags/${flag.id}`}
          fields={FEATURE_FLAG_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/admin-portal/feature-flags/${flag.id}`}
        />
      </div>
    </div>
  );
}
