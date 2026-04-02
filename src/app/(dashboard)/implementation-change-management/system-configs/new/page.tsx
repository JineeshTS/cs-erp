import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/implementation-change-management/icm-form";
import type { FieldConfig } from "@/components/implementation-change-management/icm-form";

const fields: FieldConfig[] = [
  {
    name: "configType",
    label: "Config Type",
    type: "select",
    required: true,
    options: [
      { value: "parameter_setting", label: "Parameter Setting" },
      { value: "workflow_config", label: "Workflow Config" },
      { value: "integration_config", label: "Integration Config" },
      { value: "security_config", label: "Security Config" },
      { value: "ui_customization", label: "UI Customization" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "module", label: "Module", type: "text" },
  { name: "configKey", label: "Config Key", type: "text" },
  { name: "configValue", label: "Config Value", type: "textarea" },
  { name: "previousValue", label: "Previous Value", type: "textarea" },
  { name: "changedBy", label: "Changed By", type: "text" },
  { name: "changedDate", label: "Changed Date", type: "datetime-local" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "versionNumber", label: "Version Number", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSystemConfigPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:create")))
    redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/implementation-change-management/system-configs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Settings className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New System Config</h1>
          <p className="text-sm text-muted-foreground">
            Create a new system configuration record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="System Config"
        apiPath="/api/v1/implementation-change-management/system-configs"
        fields={fields}
        returnPath="/implementation-change-management/system-configs"
      />
    </div>
  );
}
