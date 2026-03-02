import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const COLD_CHAIN_DOC_FIELDS: FieldConfig[] = [
  {
    name: "documentType",
    label: "Document Type",
    type: "select",
    required: true,
    options: [
      { value: "temperature_log", label: "Temperature Log" },
      { value: "phytosanitary", label: "Phytosanitary" },
      { value: "health_certificate", label: "Health Certificate" },
      { value: "fumigation", label: "Fumigation" },
      { value: "compliance_report", label: "Compliance Report" },
      { value: "inspection_report", label: "Inspection Report" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "commodityName", label: "Commodity Name", type: "text" },
  { name: "originCountry", label: "Origin Country", type: "text" },
  { name: "destinationCountry", label: "Destination Country", type: "text" },
  { name: "phytosanitaryCert", label: "Phytosanitary Cert", type: "text" },
  { name: "healthCert", label: "Health Cert", type: "text" },
  { name: "fumigationCert", label: "Fumigation Cert", type: "text" },
  { name: "temperatureLogUrl", label: "Temperature Log URL", type: "text" },
  { name: "complianceStandard", label: "Compliance Standard", type: "text" },
  { name: "regulatoryBody", label: "Regulatory Body", type: "text" },
  {
    name: "inspectionResult",
    label: "Inspection Result",
    type: "select",
    options: [
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
      { value: "conditional", label: "Conditional" },
      { value: "pending", label: "Pending" },
    ],
  },
  { name: "inspectionDate", label: "Inspection Date", type: "datetime-local" },
  { name: "inspectorName", label: "Inspector Name", type: "text" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "documentUrl", label: "Document URL", type: "text" },
  { name: "verifiedByName", label: "Verified By", type: "text" },
  { name: "verifiedAt", label: "Verified At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewColdChainDocPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "reefer:create"))
  )
    redirect("/reefer-container-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/cold-chain-docs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Cold Chain Document
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Cold Chain Document"
          apiPath="/api/v1/reefer-container-management/cold-chain-docs"
          fields={COLD_CHAIN_DOC_FIELDS}
          returnPath="/reefer-container-management/cold-chain-docs"
        />
      </div>
    </div>
  );
}
