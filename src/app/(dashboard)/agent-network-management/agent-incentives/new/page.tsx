import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";

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
  { name: "agentName", label: "Agent Name", type: "text" },
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

export default async function NewAgentIncentivePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:create")))
    redirect("/agent-network-management/agent-incentives");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/agent-network-management/agent-incentives"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Agent Incentives
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">New Agent Incentive</h1>
      </div>

      <AnmForm
        entityType="Agent Incentive"
        apiPath="/api/v1/agent-network-management/agent-incentives"
        fields={fields}
        returnPath="/agent-network-management/agent-incentives"
      />
    </div>
  );
}
