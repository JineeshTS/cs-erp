import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";

const EEXI_COMPLIANCE_FIELDS: FieldConfig[] = [
  {
    name: "complianceType",
    label: "Compliance Type",
    type: "select",
    required: true,
    options: [
      { value: "initial", label: "Initial" },
      { value: "annual", label: "Annual" },
      { value: "interim", label: "Interim" },
      { value: "renewal", label: "Renewal" },
    ],
  },
  { name: "vesselId", label: "Vessel ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "attainedEexi", label: "Attained EEXI", type: "text" },
  { name: "requiredEexi", label: "Required EEXI", type: "text" },
  { name: "referenceLine", label: "Reference Line", type: "text" },
  {
    name: "reductionPercentage",
    label: "Reduction Percentage",
    type: "text",
  },
  {
    name: "enginePowerLimitation",
    label: "Engine Power Limitation",
    type: "checkbox",
  },
  { name: "eplPercentage", label: "EPL Percentage", type: "text" },
  {
    name: "shaftPowerLimitation",
    label: "Shaft Power Limitation",
    type: "checkbox",
  },
  { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
  {
    name: "certificateNumber",
    label: "Certificate Number",
    type: "text",
  },
  {
    name: "certificateExpiry",
    label: "Certificate Expiry",
    type: "datetime-local",
  },
  { name: "flagState", label: "Flag State", type: "text" },
  {
    name: "classificationSociety",
    label: "Classification Society",
    type: "text",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewEexiCompliancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "vpe:create"))
  )
    redirect("/vessel-performance-efficiency/eexi-compliances");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/eexi-compliances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New EEXI Compliance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="EEXI Compliance"
          apiPath="/api/v1/vessel-performance-efficiency/eexi-compliances"
          fields={EEXI_COMPLIANCE_FIELDS}
          returnPath="/vessel-performance-efficiency/eexi-compliances"
        />
      </div>
    </div>
  );
}
