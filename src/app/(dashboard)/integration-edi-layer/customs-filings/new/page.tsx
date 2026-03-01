import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IelForm } from "@/components/integration-edi-layer/iel-form";
import type { FieldConfig } from "@/components/integration-edi-layer/iel-form";

const FILING_FIELDS: FieldConfig[] = [
  {
    name: "filingType",
    label: "Filing Type",
    type: "select",
    required: true,
    options: [
      { value: "import_declaration", label: "Import Declaration" },
      { value: "export_declaration", label: "Export Declaration" },
      { value: "transit_declaration", label: "Transit Declaration" },
      { value: "re_export", label: "Re-Export" },
      { value: "temporary_import", label: "Temporary Import" },
      { value: "free_zone", label: "Free Zone" },
    ],
  },
  {
    name: "customsAuthority",
    label: "Customs Authority",
    type: "select",
    required: true,
    options: [
      { value: "qatar_customs", label: "Qatar Customs" },
      { value: "dubai_customs", label: "Dubai Customs" },
      { value: "abu_dhabi_customs", label: "Abu Dhabi Customs" },
      { value: "saudi_customs", label: "Saudi Customs" },
      { value: "india_customs", label: "India Customs" },
    ],
  },
  {
    name: "countryCode",
    label: "Country Code",
    type: "text",
    required: true,
    placeholder: "QA",
  },
  {
    name: "portCode",
    label: "Port Code",
    type: "text",
    placeholder: "QADOH",
  },
  {
    name: "declarationType",
    label: "Declaration Type",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard" },
      { value: "simplified", label: "Simplified" },
      { value: "pre_arrival", label: "Pre-Arrival" },
      { value: "post_clearance", label: "Post Clearance" },
    ],
  },
  {
    name: "hsCode",
    label: "HS Code",
    type: "text",
    placeholder: "8471.30",
  },
  {
    name: "totalValue",
    label: "Total Value",
    type: "number",
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewCustomsFilingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "integration:create"))
  )
    redirect("/integration-edi-layer/customs-filings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/customs-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Customs Filing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="Customs Filing"
          apiPath="/api/v1/integration-edi-layer/customs/filings"
          fields={FILING_FIELDS}
          returnPath="/integration-edi-layer/customs-filings"
        />
      </div>
    </div>
  );
}
