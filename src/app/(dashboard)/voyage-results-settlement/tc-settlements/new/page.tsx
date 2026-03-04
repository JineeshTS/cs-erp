import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "settlementType",
    label: "Settlement Type",
    type: "select",
    required: true,
    options: [
      { value: "hire_payment", label: "Hire Payment" },
      { value: "ballast_bonus", label: "Ballast Bonus" },
      { value: "redelivery", label: "Redelivery" },
      { value: "bunker_adjustment", label: "Bunker Adjustment" },
      { value: "off_hire_deduction", label: "Off Hire Deduction" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: false,
  },
  {
    name: "vesselName",
    label: "Vessel Name",
    type: "text",
    required: false,
  },
  {
    name: "charterParty",
    label: "Charter Party",
    type: "text",
    required: false,
  },
  {
    name: "periodFrom",
    label: "Period From",
    type: "datetime-local",
    required: false,
  },
  {
    name: "periodTo",
    label: "Period To",
    type: "datetime-local",
    required: false,
  },
  {
    name: "hireRate",
    label: "Hire Rate",
    type: "number",
    required: false,
  },
  {
    name: "totalHireDays",
    label: "Total Hire Days",
    type: "number",
    required: false,
  },
  {
    name: "offHireDays",
    label: "Off Hire Days",
    type: "number",
    required: false,
  },
  {
    name: "grossHire",
    label: "Gross Hire",
    type: "number",
    required: false,
  },
  {
    name: "deductions",
    label: "Deductions",
    type: "number",
    required: false,
  },
  {
    name: "netPayable",
    label: "Net Payable",
    type: "number",
    required: false,
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    required: false,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    required: false,
  },
];

export default async function NewTcSettlementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/voyage-results-settlement/tc-settlements"
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New TC Settlement</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <VrsForm
          entityType="TC Settlement"
          apiPath="/api/v1/voyage-results-settlement/tc-settlements"
          fields={fields}
          returnPath="/voyage-results-settlement/tc-settlements"
        />
      </div>
    </div>
  );
}
