import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "ruleCode", label: "Rule Code", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "country",
    label: "Country Code",
    type: "text",
    required: true,
    placeholder: "QA",
  },
  { name: "region", label: "Region", type: "text" },
  { name: "regulatoryBody", label: "Regulatory Body", type: "text" },
  {
    name: "ruleType",
    label: "Rule Type",
    type: "select",
    options: [
      { value: "reporting", label: "Reporting" },
      { value: "filing", label: "Filing" },
      { value: "disclosure", label: "Disclosure" },
      { value: "audit", label: "Audit" },
      { value: "registration", label: "Registration" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "frequency", label: "Frequency", type: "text" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewComplianceRulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/compliance-rules");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/compliance-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Compliance Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Compliance Rule"
          apiPath="/api/v1/multi-entity-legal-structure/compliance-rules"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/compliance-rules"
        />
      </div>
    </div>
  );
}
