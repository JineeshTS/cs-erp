import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  MelsForm,
  type FieldConfig,
} from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "taxConfigId", label: "Tax Config ID", type: "text", required: true },
  {
    name: "rateBps",
    label: "Rate (basis points)",
    type: "number",
    required: true,
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "date",
    required: true,
  },
  { name: "effectiveTo", label: "Effective To", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewTaxRatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:create")))
    redirect("/multi-entity-legal-structure/tax-rates");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/tax-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Tax Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Tax Rate"
          apiPath="/api/v1/multi-entity-legal-structure/tax-rates"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/tax-rates"
        />
      </div>
    </div>
  );
}
