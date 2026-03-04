import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const DAMAGE_ASSESSMENT_FIELDS: FieldConfig[] = [
  {
    name: "assessmentType",
    label: "Assessment Type",
    type: "select",
    required: true,
    options: [
      { value: "ai_detection", label: "AI Detection" },
      { value: "manual_assessment", label: "Manual Assessment" },
      { value: "photo_review", label: "Photo Review" },
      { value: "severity_classification", label: "Severity Classification" },
      { value: "repair_estimate", label: "Repair Estimate" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "damageLocation", label: "Damage Location", type: "text" },
  { name: "damageCategory", label: "Damage Category", type: "text" },
  { name: "severityLevel", label: "Severity Level", type: "text" },
  { name: "aiConfidence", label: "AI Confidence", type: "text" },
  { name: "aiDetectedType", label: "AI Detected Type", type: "text" },
  { name: "estimatedRepairCost", label: "Estimated Repair Cost", type: "text" },
  { name: "repairCurrency", label: "Repair Currency", type: "text" },
  { name: "photoUrl", label: "Photo URL", type: "text" },
  { name: "photoCount", label: "Photo Count", type: "number" },
  { name: "assessedBy", label: "Assessed By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDamageAssessmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/damage-assessments");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/damage-assessments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Damage Assessment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Damage Assessment"
          apiPath="/api/v1/mobile-operations-app/damage-assessments"
          fields={DAMAGE_ASSESSMENT_FIELDS}
          returnPath="/mobile-operations-app/damage-assessments"
        />
      </div>
    </div>
  );
}
