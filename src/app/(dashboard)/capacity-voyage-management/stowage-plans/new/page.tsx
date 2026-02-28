import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "bayPlanId",
    label: "Bay Plan ID",
    type: "text",
  },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
  },
  {
    name: "containerSize",
    label: "Container Size",
    type: "text",
  },
  {
    name: "isoCode",
    label: "ISO Code",
    type: "text",
  },
  {
    name: "weightKg",
    label: "Weight (kg)",
    type: "number",
  },
  {
    name: "bayNumber",
    label: "Bay Number",
    type: "number",
  },
  {
    name: "rowNumber",
    label: "Row Number",
    type: "number",
  },
  {
    name: "tierNumber",
    label: "Tier Number",
    type: "number",
  },
  {
    name: "isHazmat",
    label: "Is Hazmat",
    type: "checkbox",
  },
  {
    name: "hazmatClass",
    label: "Hazmat Class",
    type: "text",
  },
  {
    name: "isReefer",
    label: "Is Reefer",
    type: "checkbox",
  },
  {
    name: "reeferTemp",
    label: "Reefer Temp",
    type: "number",
  },
  {
    name: "isOog",
    label: "Is OOG",
    type: "checkbox",
  },
  {
    name: "oogHeightCm",
    label: "OOG Height (cm)",
    type: "number",
  },
  {
    name: "oogWidthCm",
    label: "OOG Width (cm)",
    type: "number",
  },
  {
    name: "pol",
    label: "POL",
    type: "text",
  },
  {
    name: "pod",
    label: "POD",
    type: "text",
  },
  {
    name: "stackingOrder",
    label: "Stacking Order",
    type: "number",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "planned", label: "Planned" },
      { value: "loaded", label: "Loaded" },
      { value: "discharged", label: "Discharged" },
      { value: "shifted", label: "Shifted" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewStowagePlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/stowage-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Stowage Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Stowage Plan"
          apiPath="/api/v1/capacity-voyage-management/stowage-plans"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/stowage-plans"
        />
      </div>
    </div>
  );
}
