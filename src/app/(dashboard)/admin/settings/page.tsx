import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { OrgSettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!(await hasPermission(session.id, session.tenantId, "tenants:read"))) {
    redirect("/");
  }

  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      timezone: tenants.timezone,
      currency: tenants.currency,
      country: tenants.country,
      logoUrl: tenants.logoUrl,
      plan: tenants.plan,
    })
    .from(tenants)
    .where(eq(tenants.id, session.tenantId))
    .limit(1);

  if (!tenant) redirect("/");

  const canEdit = await hasPermission(session.id, session.tenantId, "tenants:edit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-sm text-gray-500">Manage your organization details</p>
      </div>

      <OrgSettingsForm tenant={tenant} canEdit={canEdit} />
    </div>
  );
}
