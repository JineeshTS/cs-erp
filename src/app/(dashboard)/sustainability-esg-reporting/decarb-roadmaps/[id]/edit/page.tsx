import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDecarbRoadmap } from "@/lib/sustainability-esg-reporting/service";
import { SerForm } from "@/components/sustainability-esg-reporting/ser-form";
import type { FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const fields: FieldConfig[] = [
  {
    name: "roadmapType",
    label: "Roadmap Type",
    type: "select",
    required: true,
    options: [
      { value: "fleet_transition", label: "Fleet Transition" },
      { value: "fuel_switch", label: "Fuel Switch" },
      { value: "efficiency_improvement", label: "Efficiency Improvement" },
      { value: "offset_strategy", label: "Offset Strategy" },
      { value: "technology_adoption", label: "Technology Adoption" },
    ],
  },
  { name: "milestoneName", label: "Milestone Name", type: "text" },
  { name: "targetYear", label: "Target Year", type: "number" },
  { name: "targetReductionPct", label: "Target Reduction %", type: "text" },
  { name: "currentReductionPct", label: "Current Reduction %", type: "text" },
  { name: "investmentRequired", label: "Investment Required", type: "text" },
  { name: "investmentCurrency", label: "Investment Currency", type: "text" },
  { name: "technologyArea", label: "Technology Area", type: "text" },
  {
    name: "implementationStatus",
    label: "Implementation Status",
    type: "text",
  },
  { name: "riskLevel", label: "Risk Level", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDecarbRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:edit")))
    redirect("/sustainability-esg-reporting/decarb-roadmaps");

  const { id } = await params;
  const record = await getDecarbRoadmap(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/sustainability-esg-reporting/decarb-roadmaps/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.roadmapRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.roadmapRef}
        </h1>
      </div>

      <SerForm
        entityType="Decarb Roadmap"
        apiPath={`/api/v1/sustainability-esg-reporting/decarb-roadmaps/${record.id}`}
        fields={fields}
        initialData={{
          roadmapType: record.roadmapType,
          milestoneName: record.milestoneName ?? "",
          targetYear: record.targetYear ?? "",
          targetReductionPct: record.targetReductionPct ?? "",
          currentReductionPct: record.currentReductionPct ?? "",
          investmentRequired: record.investmentRequired ?? "",
          investmentCurrency: record.investmentCurrency ?? "",
          technologyArea: record.technologyArea ?? "",
          implementationStatus: record.implementationStatus ?? "",
          riskLevel: record.riskLevel ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/sustainability-esg-reporting/decarb-roadmaps/${record.id}`}
        method="PATCH"
      />
    </div>
  );
}
