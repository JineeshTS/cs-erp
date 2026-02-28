import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "endpointUrl", label: "Endpoint URL", type: "text", required: true },
  {
    name: "syncSchedule",
    label: "Sync Schedule",
    type: "text",
    placeholder: "0 */6 * * *",
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewOracleIntegrationConfigPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/oracle-integration-configs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/oracle-integration-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Oracle Integration Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Oracle Integration Config"
          apiPath="/api/v1/multi-entity-legal-structure/oracle-integration-configs"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/oracle-integration-configs"
        />
      </div>
    </div>
  );
}
