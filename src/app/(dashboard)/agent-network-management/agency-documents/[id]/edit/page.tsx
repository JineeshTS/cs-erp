import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgencyDocument } from "@/lib/agent-network-management/service";
import {
  AnmForm,
  type FieldConfig,
} from "@/components/agent-network-management/anm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditAgencyDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const DOCUMENT_FIELDS: FieldConfig[] = [
    {
      name: "documentType",
      label: "Document Type",
      type: "select",
      required: true,
      options: [
        { value: "agency_agreement", label: "Agency Agreement" },
        { value: "amendment", label: "Amendment" },
        { value: "addendum", label: "Addendum" },
        { value: "termination_notice", label: "Termination Notice" },
        { value: "performance_report", label: "Performance Report" },
      ],
    },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "documentTitle", label: "Document Title", type: "text" },
    { name: "documentVersion", label: "Document Version", type: "text" },
    { name: "effectiveDate", label: "Effective Date", type: "datetime-local" },
    { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
    { name: "signedBy", label: "Signed By", type: "text" },
    { name: "signedDate", label: "Signed Date", type: "datetime-local" },
    { name: "fileUrl", label: "File URL", type: "text" },
    { name: "fileSizeBytes", label: "File Size (Bytes)", type: "number" },
    { name: "confidential", label: "Confidential", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getAgencyDocument(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    documentType: record.documentType ?? "",
    agentName: record.agentName ?? "",
    agentCode: record.agentCode ?? "",
    documentTitle: record.documentTitle ?? "",
    documentVersion: record.documentVersion ?? "",
    effectiveDate: record.effectiveDate
      ? new Date(record.effectiveDate).toISOString().slice(0, 16)
      : "",
    expiryDate: record.expiryDate
      ? new Date(record.expiryDate).toISOString().slice(0, 16)
      : "",
    signedBy: record.signedBy ?? "",
    signedDate: record.signedDate
      ? new Date(record.signedDate).toISOString().slice(0, 16)
      : "",
    fileUrl: record.fileUrl ?? "",
    fileSizeBytes: record.fileSizeBytes != null ? String(record.fileSizeBytes) : "",
    confidential: record.confidential ? "true" : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/agent-network-management/agency-documents/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.documentRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update agency document details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <AnmForm
          entityType="Agency Document"
          apiPath={`/api/v1/agent-network-management/agency-documents/${id}`}
          returnPath="/agent-network-management/agency-documents"
          fields={DOCUMENT_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
