import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCertificateTracking } from "@/lib/crew-management/service";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";

const CERTIFICATE_FIELDS: FieldConfig[] = [
  {
    name: "crewMemberName",
    label: "Crew Member Name",
    type: "text",
    required: true,
  },
  { name: "rank", label: "Rank", type: "text" },
  {
    name: "certificateType",
    label: "Certificate Type",
    type: "select",
    required: true,
    options: [
      { value: "stcw", label: "STCW" },
      { value: "flag_state", label: "Flag State" },
      { value: "medical", label: "Medical" },
      { value: "passport", label: "Passport" },
      { value: "endorsement", label: "Endorsement" },
      { value: "goc", label: "GOC" },
      { value: "tanker", label: "Tanker" },
      { value: "ism", label: "ISM" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "certificateName",
    label: "Certificate Name",
    type: "text",
    required: true,
  },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
  { name: "issuingCountry", label: "Issuing Country", type: "text" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "stcwRegulation", label: "STCW Regulation", type: "text" },
  { name: "competencyLevel", label: "Competency Level", type: "text" },
  {
    name: "revalidationRequired",
    label: "Revalidation Required",
    type: "checkbox",
  },
  {
    name: "revalidationDate",
    label: "Revalidation Date",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCertificateTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:edit")))
    redirect("/");

  const { id } = await params;

  const record = await getCertificateTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/crew-management/certificate-trackings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Certificate Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CrmForm
          entityType="Certificate Tracking"
          apiPath={`/api/v1/crew-management/certificate-trackings/${id}`}
          fields={CERTIFICATE_FIELDS}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/crew-management/certificate-trackings/${id}`}
        />
      </div>
    </div>
  );
}
