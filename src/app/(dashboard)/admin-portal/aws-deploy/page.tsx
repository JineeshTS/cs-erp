import { redirect } from "next/navigation";
import { Cloud } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { AwsDeployPanel } from "@/components/admin-portal/aws-deploy-panel";

export default async function AwsDeployPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "admin:read"
  );
  if (!canRead) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
          <Cloud className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deploy to AWS</h1>
          <p className="text-sm text-gray-500">
            One-click deployment of your CS-ERP instance to AWS infrastructure
          </p>
        </div>
      </div>

      <AwsDeployPanel tenantId={session.tenantId} />
    </div>
  );
}
