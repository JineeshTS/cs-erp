import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSecuringPlan } from "@/lib/oog-special-cargo-management/service";
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

export default async function EditSecuringPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "oog_special:edit"))
  )
    redirect("/oog-special-cargo-management/securing-plans");

  const { id } = await params;

  const record = await getSecuringPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/oog-special-cargo-management/securing-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Securing Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Securing Plan"
          apiPath={`/api/v1/oog-special-cargo-management/securing-plans/${id}`}
          fields={SECURING_PLAN_FIELDS}
          initialData={{
            acceptanceRef: record.acceptanceRef ?? "",
            containerNumber: record.containerNumber ?? "",
            cargoDescription: record.cargoDescription ?? "",
            grossWeightKg: record.grossWeightKg ?? "",
            centerOfGravityX: record.centerOfGravityX ?? "",
            centerOfGravityY: record.centerOfGravityY ?? "",
            centerOfGravityZ: record.centerOfGravityZ ?? "",
            lashingMethod: record.lashingMethod ?? "",
            lashingMaterial: record.lashingMaterial ?? "",
            numberOfLashings: record.numberOfLashings ?? "",
            blockingMethod: record.blockingMethod ?? "",
            bracingMethod: record.bracingMethod ?? "",
            dunnageRequired: record.dunnageRequired ?? false,
            dunnageMaterial: record.dunnageMaterial ?? "",
            calculationStandard: record.calculationStandard ?? "",
            diagramUrl: record.diagramUrl ?? "",
            verifiedByName: record.verifiedByName ?? "",
            verifiedAt: record.verifiedAt
              ? new Date(record.verifiedAt).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/oog-special-cargo-management/securing-plans/${id}`}
        />
      </div>
    </div>
  );
}
