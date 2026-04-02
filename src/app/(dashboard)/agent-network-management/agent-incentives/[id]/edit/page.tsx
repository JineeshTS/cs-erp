import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAgentIncentive } from "@/lib/agent-network-management/service";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditAgentIncentivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/agent-network-management/agent-incentives");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "incentiveType",
      label: "Incentive Type",
      type: "select",
      required: true,
      options: [
        { value: "volume_bonus", label: "Volume Bonus" },
        { value: "target_achievement", label: "Target Achievement" },
        { value: "growth_incentive", label: "Growth Incentive" },
        { value: "loyalty_bonus", label: "Loyalty Bonus" },
        { value: "special_campaign", label: "Special Campaign" },
      ],
    },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "incentivePeriod", label: "Incentive Period", type: "text" },
    { name: "targetTeu", label: "Target TEU", type: "text" },
    { name: "achievedTeu", label: "Achieved TEU", type: "text" },
    { name: "bonusRate", label: "Bonus Rate", type: "text" },
    { name: "bonusAmount", label: "Bonus Amount", type: "text" },
    { name: "incentiveCurrency", label: "Currency", type: "text" },
    { name: "payoutDate", label: "Payout Date", type: "datetime-local" },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getAgentIncentive(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/agent-network-management/agent-incentives/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.incentiveRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.incentiveRef}
        </h1>
      </div>

      <AnmForm
        entityType="Agent Incentive"
        apiPath={`/api/v1/agent-network-management/agent-incentives/${record.id}`}
        fields={fields}
        initialData={{
          incentiveType: record.incentiveType,
          agentName: record.agentName ?? "",
          agentCode: record.agentCode ?? "",
          incentivePeriod: record.incentivePeriod ?? "",
          targetTeu: record.targetTeu ?? "",
          achievedTeu: record.achievedTeu ?? "",
          bonusRate: record.bonusRate ?? "",
          bonusAmount: record.bonusAmount ?? "",
          incentiveCurrency: record.incentiveCurrency ?? "",
          payoutDate: record.payoutDate
            ? new Date(record.payoutDate).toISOString().slice(0, 16)
            : "",
          approvedBy: record.approvedBy ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/agent-network-management/agent-incentives/${record.id}`}
        method="PATCH"
      />
    </div>
  );
}
