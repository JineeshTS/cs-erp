import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const SEGREGATION_RULE_FIELDS: FieldConfig[] = [
  { name: "ruleName", label: "Rule Name", type: "text", required: true },
  {
    name: "ruleType",
    label: "Rule Type",
    type: "select",
    required: true,
    options: [
      { value: "imdg_standard", label: "IMDG Standard" },
      { value: "company_specific", label: "Company Specific" },
      { value: "port_authority", label: "Port Authority" },
      { value: "custom", label: "Custom" },
    ],
  },
  { name: "sourceClass", label: "Source Class", type: "text", required: true },
  { name: "targetClass", label: "Target Class", type: "text", required: true },
  {
    name: "segregationLevel",
    label: "Segregation Level",
    type: "select",
    required: true,
    options: [
      { value: "away_from", label: "Away From" },
      { value: "separated_from", label: "Separated From" },
      { value: "separated_by_compartment", label: "Separated by Compartment" },
      { value: "separated_longitudinally", label: "Separated Longitudinally" },
      { value: "prohibited", label: "Prohibited" },
    ],
  },
  {
    name: "stowagePosition",
    label: "Stowage Position",
    type: "select",
    options: [
      { value: "on_deck", label: "On Deck" },
      { value: "under_deck", label: "Under Deck" },
      { value: "either", label: "Either" },
    ],
  },
  { name: "stowageCategory", label: "Stowage Category", type: "text" },
  { name: "onDeck", label: "On Deck", type: "checkbox" },
  { name: "underDeck", label: "Under Deck", type: "checkbox" },
  { name: "minimumDistance", label: "Minimum Distance", type: "text" },
  { name: "distanceUnit", label: "Distance Unit", type: "text" },
  { name: "closedVsClosed", label: "Closed vs Closed", type: "text" },
  { name: "closedVsOpen", label: "Closed vs Open", type: "text" },
  { name: "openVsOpen", label: "Open vs Open", type: "text" },
  { name: "imdgReference", label: "IMDG Reference", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "priority", label: "Priority", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSegregationRulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:create")))
    redirect("/dangerous-goods-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/segregation-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Segregation Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Segregation Rule"
          apiPath="/api/v1/dangerous-goods-management/segregation-rules"
          fields={SEGREGATION_RULE_FIELDS}
          returnPath="/dangerous-goods-management/segregation-rules"
        />
      </div>
    </div>
  );
}
