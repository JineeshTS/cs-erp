import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SerForm, type FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const GHG_REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "scope1_direct", label: "Scope 1 Direct" },
      { value: "scope2_indirect", label: "Scope 2 Indirect" },
      { value: "scope3_value_chain", label: "Scope 3 Value Chain" },
      { value: "combined_report", label: "Combined Report" },
      { value: "verification_statement", label: "Verification Statement" },
    ],
  },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "reportingYear", label: "Reporting Year", type: "number" },
  { name: "scope1EmissionsMt", label: "Scope 1 Emissions (MT)", type: "text" },
  { name: "scope2EmissionsMt", label: "Scope 2 Emissions (MT)", type: "text" },
  { name: "scope3EmissionsMt", label: "Scope 3 Emissions (MT)", type: "text" },
  { name: "totalEmissionsMt", label: "Total Emissions (MT)", type: "text" },
  { name: "baselineYear", label: "Baseline Year", type: "number" },
  { name: "baselineEmissions", label: "Baseline Emissions", type: "text" },
  { name: "reductionPct", label: "Reduction (%)", type: "text" },
  { name: "verificationBody", label: "Verification Body", type: "text" },
  { name: "verifiedAt", label: "Verified At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewGhgReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "ser:create"))
  )
    redirect("/sustainability-esg-reporting/ghg-reports");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/ghg-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New GHG Report</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SerForm
          entityType="GHG Report"
          apiPath="/api/v1/sustainability-esg-reporting/ghg-reports"
          fields={GHG_REPORT_FIELDS}
          returnPath="/sustainability-esg-reporting/ghg-reports"
        />
      </div>
    </div>
  );
}
