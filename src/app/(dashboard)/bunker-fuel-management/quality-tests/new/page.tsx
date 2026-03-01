import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { BfmForm, FieldConfig } from "@/components/bunker-fuel-management/bfm-form";

const QUALITY_TEST_FIELDS: FieldConfig[] = [
  { name: "stemId", label: "Stem ID", type: "text", placeholder: "Stem UUID" },
  {
    name: "orderId",
    label: "Order ID",
    type: "text",
    placeholder: "Order UUID",
  },
  {
    name: "vesselName",
    label: "Vessel Name",
    type: "text",
    required: true,
  },
  {
    name: "sampleDate",
    label: "Sample Date",
    type: "datetime-local",
    required: true,
  },
  { name: "labName", label: "Lab Name", type: "text" },
  {
    name: "fuelType",
    label: "Fuel Type",
    type: "select",
    required: true,
    options: [
      { value: "VLSFO", label: "VLSFO" },
      { value: "HSFO", label: "HSFO" },
      { value: "LSMGO", label: "LSMGO" },
      { value: "MGO", label: "MGO" },
      { value: "MDO", label: "MDO" },
      { value: "LNG", label: "LNG" },
      { value: "ULSFO", label: "ULSFO" },
      { value: "HFO", label: "HFO" },
      { value: "BIOFUEL", label: "BIOFUEL" },
    ],
  },
  { name: "density", label: "Density", type: "number" },
  { name: "viscosity", label: "Viscosity", type: "number" },
  { name: "sulphurContent", label: "Sulphur Content", type: "number" },
  { name: "flashPoint", label: "Flash Point", type: "number" },
  { name: "waterContent", label: "Water Content", type: "number" },
  { name: "ashContent", label: "Ash Content", type: "number" },
  { name: "calorificValue", label: "Calorific Value", type: "number" },
  { name: "isoCompliant", label: "ISO Compliant", type: "checkbox" },
  { name: "marpolCompliant", label: "MARPOL Compliant", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewQualityTestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/quality-tests");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/quality-tests"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Quality Test
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Quality Test"
          apiPath="/api/v1/bunker-fuel-management/quality-tests"
          fields={QUALITY_TEST_FIELDS}
          returnPath="/bunker-fuel-management/quality-tests"
        />
      </div>
    </div>
  );
}
