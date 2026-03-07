import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewCampaignPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/campaigns"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Campaign
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Campaign"
          apiPath="/api/v1/sales-crm/campaigns"
          fields={CAMPAIGN_FIELDS}
          returnPath="/sales-crm/campaigns"
        />
      </div>
    </div>
  );
}
