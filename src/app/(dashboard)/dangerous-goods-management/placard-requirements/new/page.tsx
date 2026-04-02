import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const PLACARD_REQUIREMENT_FIELDS: FieldConfig[] = [
  { name: "unNumber", label: "UN Number", type: "text" },
  { name: "imdgClass", label: "IMDG Class", type: "text", required: true },
  { name: "subsidiaryRisk", label: "Subsidiary Risk", type: "text" },
  {
    name: "placardType",
    label: "Placard Type",
    type: "select",
    required: true,
    options: [
      { value: "primary_label", label: "Primary Label" },
      { value: "subsidiary_label", label: "Subsidiary Label" },
      { value: "mark", label: "Mark" },
      { value: "placard", label: "Placard" },
      { value: "sign", label: "Sign" },
    ],
  },
  { name: "labelCode", label: "Label Code", type: "text" },
  { name: "labelDescription", label: "Label Description", type: "text" },
  { name: "placementPosition", label: "Placement Position", type: "text" },
  { name: "sizeRequirements", label: "Size Requirements", type: "text" },
  { name: "colorSpecification", label: "Color Specification", type: "text" },
  { name: "symbolDescription", label: "Symbol Description", type: "textarea" },
  { name: "applicableToContainer", label: "Applicable to Container", type: "checkbox" },
  { name: "applicableToVehicle", label: "Applicable to Vehicle", type: "checkbox" },
  { name: "applicableToPackage", label: "Applicable to Package", type: "checkbox" },
  { name: "marinePollutantMark", label: "Marine Pollutant Mark", type: "checkbox" },
  { name: "elevatedTemperature", label: "Elevated Temperature", type: "checkbox" },
  { name: "fumigationWarning", label: "Fumigation Warning", type: "checkbox" },
  { name: "orientationArrows", label: "Orientation Arrows", type: "checkbox" },
  { name: "imdgReference", label: "IMDG Reference", type: "text" },
  { name: "imageUrl", label: "Image URL", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPlacardRequirementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:create")))
    redirect("/dangerous-goods-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/placard-requirements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Placard Requirement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Placard Requirement"
          apiPath="/api/v1/dangerous-goods-management/placard-requirements"
          fields={PLACARD_REQUIREMENT_FIELDS}
          returnPath="/dangerous-goods-management/placard-requirements"
        />
      </div>
    </div>
  );
}
