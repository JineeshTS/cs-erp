import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "shortName", label: "Short Name", type: "text" },
  { name: "slug", label: "Slug", type: "text", required: true },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "holding", label: "Holding" },
      { value: "subsidiary", label: "Subsidiary" },
      { value: "branch", label: "Branch" },
      { value: "joint_venture", label: "Joint Venture" },
      { value: "representative", label: "Representative" },
    ],
  },
  { name: "legalName", label: "Legal Name", type: "text", required: true },
  { name: "registrationNumber", label: "Registration Number", type: "text" },
  { name: "taxId", label: "Tax ID", type: "text" },
  { name: "vatNumber", label: "VAT Number", type: "text" },
  {
    name: "country",
    label: "Country Code",
    type: "text",
    required: true,
    placeholder: "QA",
  },
  { name: "region", label: "Region", type: "text" },
  {
    name: "baseCurrency",
    label: "Base Currency",
    type: "text",
    placeholder: "QAR",
  },
  {
    name: "timezone",
    label: "Timezone",
    type: "text",
    placeholder: "Asia/Qatar",
  },
  {
    name: "fiscalYearStart",
    label: "Fiscal Year Start",
    type: "text",
    placeholder: "01-01",
  },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "isHeadquarters", label: "Headquarters", type: "checkbox" },
];

export default async function NewLegalEntityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/legal-entities");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/legal-entities"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Legal Entity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Legal Entity"
          apiPath="/api/v1/multi-entity-legal-structure/legal-entities"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/legal-entities"
        />
      </div>
    </div>
  );
}
