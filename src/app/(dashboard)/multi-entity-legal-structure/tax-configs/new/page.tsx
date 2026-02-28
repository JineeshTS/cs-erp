import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm, type FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "legalEntityId", label: "Legal Entity ID", type: "text" },
  { name: "taxName", label: "Tax Name", type: "text", required: true },
  { name: "taxCode", label: "Tax Code", type: "text", required: true },
  { name: "taxType", label: "Tax Type", type: "select", options: [
    { value: "vat", label: "VAT" }, { value: "gst", label: "GST" },
    { value: "excise", label: "Excise" }, { value: "customs_duty", label: "Customs Duty" },
    { value: "withholding", label: "Withholding" }, { value: "corporate", label: "Corporate" },
    { value: "other", label: "Other" },
  ]},
  { name: "country", label: "Country Code", type: "text", required: true, placeholder: "QA" },
  { name: "region", label: "Region", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isCompound", label: "Compound Tax", type: "checkbox" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewTaxConfigPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:create")))
    redirect("/multi-entity-legal-structure/tax-configs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/tax-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Tax Config</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Tax Config"
          apiPath="/api/v1/multi-entity-legal-structure/tax-configs"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/tax-configs"
        />
      </div>
    </div>
  );
}
