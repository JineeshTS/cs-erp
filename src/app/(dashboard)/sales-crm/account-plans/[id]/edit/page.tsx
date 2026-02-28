import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmAccountPlans } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const ACCOUNT_PLAN_FIELDS: FieldConfig[] = [
  { name: "customerId", label: "Customer ID", type: "text", required: true, placeholder: "UUID of the customer" },
  { name: "planName", label: "Plan Name", type: "text", required: true },
  { name: "fiscalYear", label: "Fiscal Year", type: "number", required: true },
  { name: "accountManagerId", label: "Account Manager ID", type: "text", required: true, placeholder: "UUID of the account manager" },
  { name: "revenueTargetAmount", label: "Revenue Target", type: "number" },
  { name: "teuTarget", label: "TEU Target", type: "number" },
  { name: "retentionStrategy", label: "Retention Strategy", type: "textarea" },
  { name: "growthStrategy", label: "Growth Strategy", type: "textarea" },
  { name: "riskAssessment", label: "Risk Assessment", type: "textarea" },
  { name: "competitiveAnalysis", label: "Competitive Analysis", type: "textarea" },
  { name: "reviewDate", label: "Review Date", type: "date" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "reviewed", label: "Reviewed" },
    { value: "archived", label: "Archived" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAccountPlanPage({
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
    .from(scmAccountPlans)
    .where(
      and(
        eq(scmAccountPlans.id, id),
        eq(scmAccountPlans.tenantId, session.tenantId),
        isNull(scmAccountPlans.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    customerId: record.customerId,
    planName: record.planName,
    fiscalYear: record.fiscalYear,
    accountManagerId: record.accountManagerId,
    revenueTargetAmount: record.revenueTargetAmount ?? "",
    teuTarget: record.teuTarget ?? "",
    retentionStrategy: record.retentionStrategy ?? "",
    growthStrategy: record.growthStrategy ?? "",
    riskAssessment: record.riskAssessment ?? "",
    competitiveAnalysis: record.competitiveAnalysis ?? "",
    reviewDate: record.reviewDate ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/account-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Account Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Account Plan"
          apiPath={`/api/v1/sales-crm/account-plans/${id}`}
          fields={ACCOUNT_PLAN_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/account-plans/${id}`}
        />
      </div>
    </div>
  );
}
