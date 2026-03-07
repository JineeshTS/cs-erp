import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCountryOptions } from "@/lib/lookups";

export default async function NewLeadPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const countryOpts = await getCountryOptions();

  const LEAD_FIELDS: FieldConfig[] = [
    { name: "companyName", label: "Company Name", type: "text", required: true },
    { name: "contactName", label: "Contact Name", type: "text", required: true },
    { name: "contactEmail", label: "Contact Email", type: "text" },
    { name: "contactPhone", label: "Contact Phone", type: "text" },
    { name: "jobTitle", label: "Job Title", type: "text" },
    { name: "country", label: "Country", type: "select", options: countryOpts },
    { name: "city", label: "City", type: "text" },
    { name: "industry", label: "Industry", type: "text" },
    { name: "estimatedTeu", label: "Estimated TEU", type: "number" },
    { name: "estimatedRevenue", label: "Estimated Revenue", type: "number" },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "source", label: "Source", type: "select", required: true, options: [
      { value: "website", label: "Website" },
      { value: "referral", label: "Referral" },
      { value: "trade_show", label: "Trade Show" },
      { value: "cold_call", label: "Cold Call" },
      { value: "email_campaign", label: "Email Campaign" },
      { value: "partner", label: "Partner" },
      { value: "social_media", label: "Social Media" },
      { value: "other", label: "Other" },
    ]},
    { name: "campaignId", label: "Campaign ID", type: "text" },
    { name: "assignedTo", label: "Assigned To", type: "text" },
    { name: "qualificationScore", label: "Qualification Score", type: "number" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "unqualified", label: "Unqualified" },
      { value: "converted", label: "Converted" },
      { value: "lost", label: "Lost" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/leads"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Lead
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Lead"
          apiPath="/api/v1/sales-crm/leads"
          fields={LEAD_FIELDS}
          returnPath="/sales-crm/leads"
        />
      </div>
    </div>
  );
}
