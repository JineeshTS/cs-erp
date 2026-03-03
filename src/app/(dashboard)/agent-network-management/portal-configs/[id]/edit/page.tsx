import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortalConfig } from "@/lib/agent-network-management/service";
import { AnmForm, type FieldConfig } from "@/components/agent-network-management/anm-form";

const PORTAL_CONFIG_FIELDS: FieldConfig[] = [
  {
    name: "configType",
    label: "Config Type",
    type: "select",
    required: true,
    options: [
      { value: "portal_access", label: "Portal Access" },
      { value: "branding_setup", label: "Branding Setup" },
      { value: "module_permissions", label: "Module Permissions" },
      { value: "api_integration", label: "API Integration" },
      { value: "sso_config", label: "SSO Config" },
    ],
  },
  { name: "agentName", label: "Agent Name", type: "text" },
  { name: "agentCode", label: "Agent Code", type: "text" },
  { name: "portalUrl", label: "Portal URL", type: "text" },
  { name: "brandingTheme", label: "Branding Theme", type: "text" },
  { name: "enabledModules", label: "Enabled Modules", type: "textarea" },
  { name: "maxUsers", label: "Max Users", type: "number" },
  { name: "ssoEnabled", label: "SSO Enabled", type: "checkbox" },
  { name: "apiKeyIssued", label: "API Key Issued", type: "checkbox" },
  { name: "lastLoginAt", label: "Last Login At", type: "datetime-local" },
  { name: "activeSessions", label: "Active Sessions", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPortalConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/agent-network-management/portal-configs");

  const { id } = await params;

  const record = await getPortalConfig(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/agent-network-management/portal-configs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Portal Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AnmForm
          entityType="Portal Config"
          apiPath={`/api/v1/agent-network-management/portal-configs/${id}`}
          fields={PORTAL_CONFIG_FIELDS}
          initialData={{
            configType: record.configType,
            agentName: record.agentName ?? "",
            agentCode: record.agentCode ?? "",
            portalUrl: record.portalUrl ?? "",
            brandingTheme: record.brandingTheme ?? "",
            enabledModules: record.enabledModules ?? "",
            maxUsers: record.maxUsers ?? "",
            ssoEnabled: record.ssoEnabled ? "true" : "",
            apiKeyIssued: record.apiKeyIssued ? "true" : "",
            lastLoginAt: record.lastLoginAt
              ? new Date(record.lastLoginAt).toISOString().slice(0, 16)
              : "",
            activeSessions: record.activeSessions ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/agent-network-management/portal-configs/${id}`}
        />
      </div>
    </div>
  );
}
