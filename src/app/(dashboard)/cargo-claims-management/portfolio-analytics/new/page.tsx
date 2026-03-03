import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";

const ANALYTICS_FIELDS: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    options: [
      { value: "quarterly_review", label: "Quarterly Review" },
      { value: "annual_summary", label: "Annual Summary" },
      { value: "trend_analysis", label: "Trend Analysis" },
      { value: "loss_ratio", label: "Loss Ratio" },
      { value: "reserve_adequacy", label: "Reserve Adequacy" },
    ],
  },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "totalClaimsCount", label: "Total Claims Count", type: "number" },
  { name: "openClaimsCount", label: "Open Claims Count", type: "number" },
  { name: "closedClaimsCount", label: "Closed Claims Count", type: "number" },
  { name: "totalIncurredUsd", label: "Total Incurred (USD)", type: "text" },
  { name: "totalPaidUsd", label: "Total Paid (USD)", type: "text" },
  { name: "totalReservedUsd", label: "Total Reserved (USD)", type: "text" },
  { name: "totalRecoveredUsd", label: "Total Recovered (USD)", type: "text" },
  { name: "lossRatio", label: "Loss Ratio", type: "text" },
  { name: "avgSettlementDays", label: "Avg Settlement Days", type: "number" },
  { name: "avgClaimValueUsd", label: "Avg Claim Value (USD)", type: "text" },
  { name: "topClaimCategory", label: "Top Claim Category", type: "text" },
  { name: "trendDirection", label: "Trend Direction", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPortfolioAnalyticPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/portfolio-analytics"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Portfolio Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new portfolio analytics report
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Portfolio Analytics"
          apiPath="/api/v1/cargo-claims-management/portfolio-analytics"
          returnPath="/cargo-claims-management/portfolio-analytics"
          fields={ANALYTICS_FIELDS}
        />
      </div>
    </div>
  );
}
