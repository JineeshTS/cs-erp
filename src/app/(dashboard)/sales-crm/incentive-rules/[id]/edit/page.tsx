import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmIncentiveRules } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const INCENTIVE_RULE_FIELDS: FieldConfig[] = [
  { name: "ruleName", label: "Rule Name", type: "text", required: true },
  { name: "ruleCode", label: "Rule Code", type: "text", required: true },
  { name: "targetType", label: "Target Type", type: "select", required: true, options: [
    { value: "revenue", label: "Revenue" },
    { value: "teu", label: "TEU" },
    { value: "new_customer", label: "New Customer" },
    { value: "retention", label: "Retention" },
  ]},
  { name: "thresholdPercent", label: "Threshold %", type: "number", required: true },
  { name: "commissionRate", label: "Commission Rate", type: "number", required: true },
  { name: "bonusAmount", label: "Bonus Amount", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "cappedAt", label: "Capped At", type: "number" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "appliesTo", label: "Applies To", type: "select", options: [
    { value: "all", label: "All" },
    { value: "individual", label: "Individual" },
    { value: "team", label: "Team" },
    { value: "region", label: "Region" },
  ]},
  { name: "region", label: "Region", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "isActive", label: "Is Active", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIncentiveRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const { id } = await params;
  const record = await db
    .select()
    .from(scmIncentiveRules)
    .where(
      and(
        eq(scmIncentiveRules.id, id),
        eq(scmIncentiveRules.tenantId, session.tenantId),
        isNull(scmIncentiveRules.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    ruleName: record.ruleName,
    ruleCode: record.ruleCode,
    targetType: record.targetType,
    thresholdPercent: record.thresholdPercent,
    commissionRate: record.commissionRate,
    bonusAmount: record.bonusAmount ?? "",
    currency: record.currency ?? "",
    cappedAt: record.cappedAt ?? "",
    effectiveFrom: record.effectiveFrom?.toISOString()?.slice(0, 16) ?? "",
    effectiveTo: record.effectiveTo?.toISOString()?.slice(0, 16) ?? "",
    appliesTo: record.appliesTo ?? "all",
    region: record.region ?? "",
    tradeLane: record.tradeLane ?? "",
    isActive: record.isActive ?? true,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/incentive-rules/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Incentive Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Incentive Rule"
          apiPath={`/api/v1/sales-crm/incentive-rules/${id}`}
          fields={INCENTIVE_RULE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/incentive-rules/${id}`}
        />
      </div>
    </div>
  );
}
