import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewImportClearancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/import-clearances");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const IMPORT_CLEARANCE_FIELDS: FieldConfig[] = [
    {
      name: "declarationType",
      label: "Declaration Type",
      type: "select",
      required: true,
      options: [
        { value: "import", label: "Import" },
        { value: "temporary_import", label: "Temporary Import" },
        { value: "re_import", label: "Re-Import" },
        { value: "warehousing", label: "Warehousing" },
      ],
    },
    { name: "declarationNumber", label: "Declaration Number", type: "text" },
    { name: "customsOffice", label: "Customs Office", type: "text" },
    { name: "importerName", label: "Importer Name", type: "text", required: true },
    { name: "importerCode", label: "Importer Code", type: "text" },
    { name: "importerTaxId", label: "Importer Tax ID", type: "text" },
    { name: "consignmentRef", label: "Consignment Ref", type: "text" },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "portOfOrigin", label: "Port of Origin", type: "text" },
    { name: "portOfEntry", label: "Port of Entry", type: "text", required: true },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "hsCode", label: "HS Code", type: "text" },
    { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text", placeholder: "0.00" },
    { name: "numberOfPackages", label: "Number of Packages", type: "number" },
    { name: "invoiceValue", label: "Invoice Value", type: "text", placeholder: "0.00" },
    { name: "invoiceCurrency", label: "Invoice Currency", type: "select", options: currencyOpts },
    { name: "customsValue", label: "Customs Value", type: "text", placeholder: "0.00" },
    { name: "dutyAmount", label: "Duty Amount", type: "text", placeholder: "0.00" },
    { name: "vatAmount", label: "VAT Amount", type: "text", placeholder: "0.00" },
    { name: "totalTaxes", label: "Total Taxes", type: "text", placeholder: "0.00" },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      options: [
        { value: "cash", label: "Cash" },
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "guarantee", label: "Guarantee" },
        { value: "deferred", label: "Deferred" },
      ],
    },
    { name: "filedAt", label: "Filed At", type: "datetime-local" },
    { name: "clearedAt", label: "Cleared At", type: "datetime-local" },
    { name: "releaseOrderNumber", label: "Release Order Number", type: "text" },
    { name: "inspectionRequired", label: "Inspection Required", type: "checkbox" },
    {
      name: "inspectionResult",
      label: "Inspection Result",
      type: "select",
      options: [
        { value: "passed", label: "Passed" },
        { value: "failed", label: "Failed" },
        { value: "pending", label: "Pending" },
      ],
    },
    { name: "brokerName", label: "Broker Name", type: "text" },
    { name: "brokerLicense", label: "Broker License", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/import-clearances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Import Clearance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="Import Clearance"
          apiPath="/api/v1/customs-compliance-regulatory/import-clearances"
          fields={IMPORT_CLEARANCE_FIELDS}
          returnPath="/customs-compliance-regulatory/import-clearances"
        />
      </div>
    </div>
  );
}
