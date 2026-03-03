import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  AnmForm,
  type FieldConfig,
} from "@/components/agent-network-management/anm-form";

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
  { name: "agentName", label: "Agent Name", type: "text" },
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

export default async function NewAgencyDocumentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/agent-network-management/agency-documents"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Agency Document
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new agency document record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <AnmForm
          entityType="Agency Document"
          apiPath="/api/v1/agent-network-management/agency-documents"
          returnPath="/agent-network-management/agency-documents"
          fields={DOCUMENT_FIELDS}
        />
      </div>
    </div>
  );
}
