import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SerForm, type FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const CHARTER_FIELDS: FieldConfig[] = [
  {
    name: "charterType",
    label: "Charter Type",
    type: "select",
    required: true,
    options: [
      { value: "annual_disclosure", label: "Annual Disclosure" },
      { value: "voyage_alignment", label: "Voyage Alignment" },
      { value: "trajectory_assessment", label: "Trajectory Assessment" },
      { value: "portfolio_report", label: "Portfolio Report" },
      { value: "benchmark_comparison", label: "Benchmark Comparison" },
    ],
  },
  { name: "reportingYear", label: "Reporting Year", type: "number" },
  { name: "totalVoyages", label: "Total Voyages", type: "number" },
  { name: "alignedVoyages", label: "Aligned Voyages", type: "number" },
  { name: "alignmentScore", label: "Alignment Score", type: "text" },
  { name: "climateTarget", label: "Climate Target", type: "text" },
  { name: "trajectoryYear", label: "Trajectory Year", type: "number" },
  { name: "requiredIntensity", label: "Required Intensity", type: "text" },
  { name: "actualIntensity", label: "Actual Intensity", type: "text" },
  { name: "gapToTarget", label: "Gap to Target", type: "text" },
  { name: "disclosureLevel", label: "Disclosure Level", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSeaCargoCharterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "ser:create"))
  )
    redirect("/sustainability-esg-reporting/sea-cargo-charters");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/sea-cargo-charters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Sea Cargo Charter
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SerForm
          entityType="Sea Cargo Charter"
          apiPath="/api/v1/sustainability-esg-reporting/sea-cargo-charters"
          fields={CHARTER_FIELDS}
          returnPath="/sustainability-esg-reporting/sea-cargo-charters"
        />
      </div>
    </div>
  );
}
