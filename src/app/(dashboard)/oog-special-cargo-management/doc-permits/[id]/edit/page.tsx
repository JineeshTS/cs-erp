import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDocPermit } from "@/lib/oog-special-cargo-management/service";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";

const DOC_PERMIT_FIELDS: FieldConfig[] = [
  {
    name: "documentType",
    label: "Document Type",
    type: "select",
    required: true,
    options: [
      { value: "transport_permit", label: "Transport Permit" },
      { value: "port_permit", label: "Port Permit" },
      { value: "road_permit", label: "Road Permit" },
      { value: "survey_report", label: "Survey Report" },
      { value: "lashing_certificate", label: "Lashing Certificate" },
      { value: "cargo_plan", label: "Cargo Plan" },
      { value: "insurance_certificate", label: "Insurance Certificate" },
    ],
  },
  { name: "acceptanceRef", label: "Acceptance Ref", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  {
    name: "documentTitle",
    label: "Document Title",
    type: "text",
    required: true,
  },
  { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
  { name: "issueDate", label: "Issue Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "permitNumber", label: "Permit Number", type: "text" },
  { name: "permitScope", label: "Permit Scope", type: "text" },
  {
    name: "portOfApplicability",
    label: "Port of Applicability",
    type: "text",
  },
  {
    name: "countryOfApplicability",
    label: "Country of Applicability",
    type: "text",
  },
  {
    name: "conditionsOfApproval",
    label: "Conditions of Approval",
    type: "textarea",
  },
  { name: "documentUrl", label: "Document URL", type: "text" },
  { name: "verifiedByName", label: "Verified By", type: "text" },
  { name: "verifiedAt", label: "Verified At", type: "datetime-local" },
  { name: "renewalRequired", label: "Renewal Required", type: "checkbox" },
  { name: "renewalDate", label: "Renewal Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDocPermitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:edit")))
    redirect("/oog-special-cargo-management/doc-permits");

  const { id } = await params;
  const record = await getDocPermit(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/oog-special-cargo-management/doc-permits/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Document/Permit
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Document/Permit"
          apiPath={`/api/v1/oog-special-cargo-management/doc-permits/${id}`}
          fields={DOC_PERMIT_FIELDS}
          initialData={{
            documentType: record.documentType ?? "",
            acceptanceRef: record.acceptanceRef ?? "",
            containerNumber: record.containerNumber ?? "",
            documentTitle: record.documentTitle ?? "",
            issuingAuthority: record.issuingAuthority ?? "",
            issueDate: record.issueDate
              ? new Date(record.issueDate).toISOString()
              : "",
            expiryDate: record.expiryDate
              ? new Date(record.expiryDate).toISOString()
              : "",
            permitNumber: record.permitNumber ?? "",
            permitScope: record.permitScope ?? "",
            portOfApplicability: record.portOfApplicability ?? "",
            countryOfApplicability: record.countryOfApplicability ?? "",
            conditionsOfApproval: record.conditionsOfApproval ?? "",
            documentUrl: record.documentUrl ?? "",
            verifiedByName: record.verifiedByName ?? "",
            verifiedAt: record.verifiedAt
              ? new Date(record.verifiedAt).toISOString()
              : "",
            renewalRequired: record.renewalRequired ?? false,
            renewalDate: record.renewalDate
              ? new Date(record.renewalDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/oog-special-cargo-management/doc-permits/${id}`}
        />
      </div>
    </div>
  );
}
