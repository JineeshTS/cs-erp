import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIsoCertificationTracking } from "@/lib/audit-compliance-management/service";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "certificationType",
    label: "Certification Type",
    type: "select",
    options: [
      { value: "iso_9001", label: "ISO 9001" },
      { value: "iso_14001", label: "ISO 14001" },
      { value: "iso_27001", label: "ISO 27001" },
      { value: "iso_45001", label: "ISO 45001" },
      { value: "iso_22000", label: "ISO 22000" },
      { value: "isps_code", label: "ISPS Code" },
    ],
  },
  { name: "standard", label: "Standard", type: "text", required: true },
  { name: "scope", label: "Scope", type: "textarea" },
  { name: "certifyingBody", label: "Certifying Body", type: "text" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "renewalDate", label: "Renewal Date", type: "datetime-local" },
  {
    name: "lastSurveillanceDate",
    label: "Last Surveillance Date",
    type: "datetime-local",
  },
  {
    name: "nextSurveillanceDate",
    label: "Next Surveillance Date",
    type: "datetime-local",
  },
  { name: "nonConformities", label: "Non-Conformities", type: "number" },
  {
    name: "majorNonConformities",
    label: "Major Non-Conformities",
    type: "number",
  },
  { name: "documentUrl", label: "Document URL", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIsoCertificationTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getIsoCertificationTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/audit-compliance-management/iso-certification-trackings/${id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit ISO Certification Tracking
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="ISO Certification Tracking"
          apiPath={`/api/v1/audit-compliance-management/iso-certification-trackings/${id}`}
          fields={fields}
          initialData={record as Record<string, unknown>}
          isEdit
          returnPath={`/audit-compliance-management/iso-certification-trackings/${id}`}
        />
      </div>
    </div>
  );
}
