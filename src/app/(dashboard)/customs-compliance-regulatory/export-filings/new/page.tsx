import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";

const EXPORT_FILING_FIELDS: FieldConfig[] = [
  {
    name: "declarationType",
    label: "Declaration Type",
    type: "select",
    required: true,
    options: [
      { value: "export", label: "Export" },
      { value: "re_export", label: "Re-Export" },
      { value: "temporary_export", label: "Temporary Export" },
    ],
  },
  { name: "declarationNumber", label: "Declaration Number", type: "text" },
  { name: "customsOffice", label: "Customs Office", type: "text" },
  { name: "exporterName", label: "Exporter Name", type: "text", required: true },
  { name: "exporterCode", label: "Exporter Code", type: "text" },
  { name: "exporterTaxId", label: "Exporter Tax ID", type: "text" },
  { name: "consigneeName", label: "Consignee Name", type: "text" },
  { name: "consigneeCountry", label: "Consignee Country", type: "text" },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "portOfLoading", label: "Port of Loading", type: "text", required: true },
  { name: "portOfDischarge", label: "Port of Discharge", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
  { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text", placeholder: "0.00" },
  { name: "numberOfPackages", label: "Number of Packages", type: "number" },
  { name: "fobValue", label: "FOB Value", type: "text", placeholder: "0.00" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "exportLicenseRequired", label: "Export License Required", type: "checkbox" },
  { name: "exportLicenseNumber", label: "Export License Number", type: "text" },
  { name: "filedAt", label: "Filed At", type: "datetime-local" },
  { name: "approvedAt", label: "Approved At", type: "datetime-local" },
  { name: "brokerName", label: "Broker Name", type: "text" },
  { name: "brokerLicense", label: "Broker License", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewExportFilingPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/export-filings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/export-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Export Filing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="Export Filing"
          apiPath="/api/v1/customs-compliance-regulatory/export-filings"
          fields={EXPORT_FILING_FIELDS}
          returnPath="/customs-compliance-regulatory/export-filings"
        />
      </div>
    </div>
  );
}
