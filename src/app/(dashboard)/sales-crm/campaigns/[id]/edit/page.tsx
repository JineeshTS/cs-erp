import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmCampaigns } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const CAMPAIGN_FIELDS: FieldConfig[] = [
  { name: "campaignName", label: "Campaign Name", type: "text", required: true },
  { name: "campaignCode", label: "Campaign Code", type: "text", required: true },
  { name: "campaignType", label: "Campaign Type", type: "select", required: true, options: [
    { value: "email", label: "Email" },
    { value: "trade_show", label: "Trade Show" },
    { value: "webinar", label: "Webinar" },
    { value: "print", label: "Print" },
    { value: "digital_ads", label: "Digital Ads" },
    { value: "referral_program", label: "Referral Program" },
    { value: "other", label: "Other" },
  ]},
  { name: "description", label: "Description", type: "textarea" },
  { name: "targetAudience", label: "Target Audience", type: "text" },
  { name: "channel", label: "Channel", type: "text" },
  { name: "budgetAmount", label: "Budget Amount", type: "number" },
  { name: "spentAmount", label: "Spent Amount", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "startDate", label: "Start Date", type: "datetime-local", required: true },
  { name: "endDate", label: "End Date", type: "datetime-local" },
  { name: "region", label: "Region", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCampaignPage({
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
    .from(scmCampaigns)
    .where(
      and(
        eq(scmCampaigns.id, id),
        eq(scmCampaigns.tenantId, session.tenantId),
        isNull(scmCampaigns.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    campaignName: record.campaignName,
    campaignCode: record.campaignCode,
    campaignType: record.campaignType ?? "",
    description: record.description ?? "",
    targetAudience: record.targetAudience ?? "",
    channel: record.channel ?? "",
    budgetAmount: record.budgetAmount ?? "",
    spentAmount: record.spentAmount ?? "",
    currency: record.currency ?? "",
    startDate: record.startDate?.toISOString() ?? "",
    endDate: record.endDate?.toISOString() ?? "",
    region: record.region ?? "",
    tradeLane: record.tradeLane ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/campaigns/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Campaign
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Campaign"
          apiPath={`/api/v1/sales-crm/campaigns/${id}`}
          fields={CAMPAIGN_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/campaigns/${id}`}
        />
      </div>
    </div>
  );
}
