import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSystemConfig } from "@/lib/implementation-change-management/service";
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

export default async function EditSystemConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:edit")))
    redirect("/login");

  const { id } = await params;
  const record = await getSystemConfig(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/implementation-change-management/system-configs/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Settings className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit System Config</h1>
          <p className="text-sm text-muted-foreground">
            Update system configuration record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="System Config"
        apiPath={`/api/v1/implementation-change-management/system-configs/${id}`}
        fields={fields}
        initialData={{
          configType: record.configType ?? "",
          title: record.title ?? "",
          module: record.module ?? "",
          configKey: record.configKey ?? "",
          configValue: record.configValue ?? "",
          previousValue: record.previousValue ?? "",
          changedBy: record.changedBy ?? "",
          changedDate: record.changedDate?.toISOString() ?? "",
          isActive: record.isActive ?? false,
          versionNumber: record.versionNumber ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/implementation-change-management/system-configs/${id}`}
      />
    </div>
  );
}
