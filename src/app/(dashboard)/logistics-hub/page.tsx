import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserPermissions } from "@/lib/rbac";
import { getCategoryBySlug } from "@/lib/navigation/categories";
import { CategoryHubPage } from "@/components/hub/category-hub-page";

export default async function LogisticsHubPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const permissions = await getUserPermissions(session.id, session.tenantId);
  const category = getCategoryBySlug("logistics")!;
  return <CategoryHubPage category={category} permissions={permissions} />;
}
