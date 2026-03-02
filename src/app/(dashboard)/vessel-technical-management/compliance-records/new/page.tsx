import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";

const fields: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  {
    name: "complianceType",
    label: "Compliance Type",
    type: "select",
    required: true,
    options: [
      { value: "ism_audit", label: "ISM Audit" },
      { value: "solas", label: "SOLAS" },
      { value: "marpol", label: "MARPOL" },
      { value: "isps", label: "ISPS" },
      { value: "mlc", label: "MLC" },
      { value: "ballast_water", label: "Ballast Water" },
      { value: "ems", label: "EMS" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "certificateName", label: "Certificate Name", type: "text" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
  { name: "issuedDate", label: "Issued Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "auditDate", label: "Audit Date", type: "datetime-local" },
  { name: "auditorName", label: "Auditor Name", type: "text" },
  { name: "nonConformities", label: "Non-Conformities", type: "number" },
  { name: "majorNc", label: "Major NC", type: "number" },
  { name: "minorNc", label: "Minor NC", type: "number" },
  { name: "observations", label: "Observations", type: "number" },
  { name: "closureDeadline", label: "Closure Deadline", type: "datetime-local" },
  {
    name: "nextInspectionDate",
    label: "Next Inspection Date",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewComplianceRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/vessel-technical-management/compliance-records"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Compliance Record
        </h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <VtmForm
          entityType="Compliance Record"
          apiPath="/api/v1/vessel-technical-management/compliance-records"
          fields={fields}
          returnPath="/vessel-technical-management/compliance-records"
        />
      </div>
    </div>
  );
}
