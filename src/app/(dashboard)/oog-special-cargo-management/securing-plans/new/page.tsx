import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";

const SECURING_PLAN_FIELDS: FieldConfig[] = [
  { name: "acceptanceRef", label: "Acceptance Ref", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  {
    name: "cargoDescription",
    label: "Cargo Description",
    type: "textarea",
    required: true,
  },
  {
    name: "grossWeightKg",
    label: "Gross Weight (kg)",
    type: "text",
    required: true,
  },
  { name: "centerOfGravityX", label: "Center of Gravity X", type: "text" },
  { name: "centerOfGravityY", label: "Center of Gravity Y", type: "text" },
  { name: "centerOfGravityZ", label: "Center of Gravity Z", type: "text" },
  {
    name: "lashingMethod",
    label: "Lashing Method",
    type: "select",
    options: [
      { value: "chain", label: "Chain" },
      { value: "wire_rope", label: "Wire Rope" },
      { value: "webbing", label: "Webbing" },
      { value: "turnbuckle", label: "Turnbuckle" },
      { value: "combination", label: "Combination" },
    ],
  },
  { name: "lashingMaterial", label: "Lashing Material", type: "text" },
  { name: "numberOfLashings", label: "Number of Lashings", type: "number" },
  { name: "blockingMethod", label: "Blocking Method", type: "text" },
  { name: "bracingMethod", label: "Bracing Method", type: "text" },
  { name: "dunnageRequired", label: "Dunnage Required", type: "checkbox" },
  { name: "dunnageMaterial", label: "Dunnage Material", type: "text" },
  {
    name: "calculationStandard",
    label: "Calculation Standard",
    type: "select",
    options: [
      { value: "css_code", label: "CSS Code" },
      { value: "imo_msc", label: "IMO MSC" },
      { value: "ctus", label: "CTUS" },
      { value: "company", label: "Company" },
    ],
  },
  { name: "diagramUrl", label: "Diagram URL", type: "text" },
  { name: "verifiedByName", label: "Verified By", type: "text" },
  { name: "verifiedAt", label: "Verified At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSecuringPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "oog_special:create"
    ))
  )
    redirect("/oog-special-cargo-management/securing-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/securing-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Securing Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Securing Plan"
          apiPath="/api/v1/oog-special-cargo-management/securing-plans"
          fields={SECURING_PLAN_FIELDS}
          returnPath="/oog-special-cargo-management/securing-plans"
        />
      </div>
    </div>
  );
}
