import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getTcfdReport } from "@/lib/sustainability-esg-reporting/service";
import { SerForm } from "@/components/sustainability-esg-reporting/ser-form";
import type { FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const fields: FieldConfig[] = [
  {
    name: "tcfdType",
    label: "TCFD Type",
    type: "select",
    required: true,
    options: [
      { value: "governance_disclosure", label: "Governance Disclosure" },
      { value: "strategy_assessment", label: "Strategy Assessment" },
      { value: "risk_management", label: "Risk Management" },
      { value: "metrics_targets", label: "Metrics & Targets" },
      { value: "scenario_analysis", label: "Scenario Analysis" },
    ],
  },
  { name: "reportingYear", label: "Reporting Year", type: "number" },
  { name: "pillarArea", label: "Pillar Area", type: "text" },
  { name: "disclosureTitle", label: "Disclosure Title", type: "text" },
  { name: "scenarioName", label: "Scenario Name", type: "text" },
  { name: "temperaturePathway", label: "Temperature Pathway", type: "text" },
  { name: "financialImpact", label: "Financial Impact", type: "text" },
  { name: "impactCurrency", label: "Impact Currency", type: "text" },
  { name: "riskCategory", label: "Risk Category", type: "text" },
  {
    name: "opportunityCategory",
    label: "Opportunity Category",
    type: "text",
  },
  { name: "maturityLevel", label: "Maturity Level", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTcfdReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:edit")))
    redirect("/sustainability-esg-reporting/tcfd-reports");

  const { id } = await params;
  const record = await getTcfdReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/sustainability-esg-reporting/tcfd-reports/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.tcfdRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.tcfdRef}
        </h1>
      </div>

      <SerForm
        entityType="TCFD Report"
        apiPath={`/api/v1/sustainability-esg-reporting/tcfd-reports/${record.id}`}
        fields={fields}
        initialData={{
          tcfdType: record.tcfdType,
          reportingYear: record.reportingYear ?? "",
          pillarArea: record.pillarArea ?? "",
          disclosureTitle: record.disclosureTitle ?? "",
          scenarioName: record.scenarioName ?? "",
          temperaturePathway: record.temperaturePathway ?? "",
          financialImpact: record.financialImpact ?? "",
          impactCurrency: record.impactCurrency ?? "",
          riskCategory: record.riskCategory ?? "",
          opportunityCategory: record.opportunityCategory ?? "",
          maturityLevel: record.maturityLevel ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/sustainability-esg-reporting/tcfd-reports/${record.id}`}
        method="PATCH"
      />
    </div>
  );
}
