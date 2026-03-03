import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSubAgentConfig } from "@/lib/agent-network-management/service";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";

const fields: FieldConfig[] = [
  {
    name: "configType",
    label: "Config Type",
    type: "select",
    required: true,
    options: [
      { value: "sub_agent_appointment", label: "Sub-Agent Appointment" },
      { value: "access_grant", label: "Access Grant" },
      { value: "territory_assignment", label: "Territory Assignment" },
      { value: "commission_split", label: "Commission Split" },
      { value: "reporting_config", label: "Reporting Config" },
    ],
  },
  { name: "parentAgentName", label: "Parent Agent Name", type: "text" },
  { name: "parentAgentCode", label: "Parent Agent Code", type: "text" },
  { name: "subAgentName", label: "Sub-Agent Name", type: "text" },
  { name: "subAgentCode", label: "Sub-Agent Code", type: "text" },
  { name: "territory", label: "Territory", type: "text" },
  { name: "accessLevel", label: "Access Level", type: "text" },
  { name: "commissionSplitPct", label: "Commission Split %", type: "text" },
  { name: "bookingAuthority", label: "Booking Authority", type: "checkbox" },
  { name: "maxBookingValue", label: "Max Booking Value", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSubAgentConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/agent-network-management/sub-agent-configs");

  const { id } = await params;
  const record = await getSubAgentConfig(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/agent-network-management/sub-agent-configs/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.configRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.configRef}
        </h1>
      </div>

      <AnmForm
        entityType="Sub-Agent Config"
        apiPath={`/api/v1/agent-network-management/sub-agent-configs/${record.id}`}
        fields={fields}
        initialData={{
          configType: record.configType,
          parentAgentName: record.parentAgentName ?? "",
          parentAgentCode: record.parentAgentCode ?? "",
          subAgentName: record.subAgentName ?? "",
          subAgentCode: record.subAgentCode ?? "",
          territory: record.territory ?? "",
          accessLevel: record.accessLevel ?? "",
          commissionSplitPct: record.commissionSplitPct ?? "",
          bookingAuthority: record.bookingAuthority ? "true" : "",
          maxBookingValue: record.maxBookingValue ?? "",
          effectiveFrom: record.effectiveFrom ? new Date(record.effectiveFrom).toISOString().slice(0, 16) : "",
          effectiveTo: record.effectiveTo ? new Date(record.effectiveTo).toISOString().slice(0, 16) : "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/agent-network-management/sub-agent-configs/${record.id}`}
      />
    </div>
  );
}
