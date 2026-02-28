import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const DOCUMENT_FIELDS: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "documentNumber", label: "Document Number", type: "text" },
  {
    name: "documentType",
    label: "Document Type",
    type: "select",
    required: true,
    options: [
      { value: "bill_of_lading", label: "Bill of Lading" },
      { value: "invoice", label: "Invoice" },
      { value: "certificate", label: "Certificate" },
      { value: "contract", label: "Contract" },
      { value: "customs", label: "Customs" },
      { value: "manifest", label: "Manifest" },
      { value: "insurance", label: "Insurance" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "fileName", label: "File Name", type: "text", required: true },
  { name: "fileSize", label: "File Size (bytes)", type: "number", required: true },
  { name: "mimeType", label: "MIME Type", type: "text", required: true },
  { name: "storagePath", label: "Storage Path", type: "text", required: true },
  {
    name: "classification",
    label: "Classification",
    type: "select",
    options: [
      { value: "public", label: "Public" },
      { value: "internal", label: "Internal" },
      { value: "confidential", label: "Confidential" },
      { value: "restricted", label: "Restricted" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "pending_review", label: "Pending Review" },
      { value: "approved", label: "Approved" },
    ],
  },
  { name: "expiresAt", label: "Expires At", type: "date" },
];

export default async function NewDocumentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "documents:create"))
  )
    redirect("/document-management-system/documents");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/documents"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Document</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Document"
          apiPath="/api/v1/document-management-system/documents"
          fields={DOCUMENT_FIELDS}
          returnPath="/document-management-system/documents"
        />
      </div>
    </div>
  );
}
