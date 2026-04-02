import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDocument } from "@/lib/customer-portal/service";
import { CspForm, FieldConfig } from "@/components/customer-portal/csp-form";

const fields: FieldConfig[] = [
  {
    name: "documentType",
    label: "Document Type",
    type: "select",
    required: true,
    options: [
      { value: "bill_of_lading", label: "Bill of Lading" },
      { value: "commercial_invoice", label: "Commercial Invoice" },
      { value: "packing_list", label: "Packing List" },
      { value: "certificate_of_origin", label: "Certificate of Origin" },
      { value: "customs_declaration", label: "Customs Declaration" },
      { value: "delivery_order", label: "Delivery Order" },
      { value: "freight_invoice", label: "Freight Invoice" },
      { value: "insurance_cert", label: "Insurance Certificate" },
      { value: "inspection_cert", label: "Inspection Certificate" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "documentName",
    label: "Document Name",
    type: "text",
    required: true,
  },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "fileUrl", label: "File URL", type: "text" },
  { name: "fileSize", label: "File Size (bytes)", type: "number" },
  { name: "mimeType", label: "MIME Type", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "available", label: "Available" },
      { value: "expired", label: "Expired" },
      { value: "revoked", label: "Revoked" },
    ],
  },
  {
    name: "isCustomerVisible",
    label: "Customer Visible",
    type: "checkbox",
  },
  { name: "expiresAt", label: "Expires At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:edit")))
    redirect("/customer-portal/documents");

  const { id } = await params;

  const document = await getDocument(id, session.tenantId);
  if (!document) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customer-portal/documents/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Document"
          apiPath={`/api/v1/customer-portal/documents/${id}`}
          fields={fields}
          initialData={{
            documentType: document.documentType,
            documentName: document.documentName,
            blNumber: document.blNumber ?? "",
            fileUrl: document.fileUrl ?? "",
            fileSize: document.fileSize ?? "",
            mimeType: document.mimeType ?? "",
            status: document.status,
            isCustomerVisible: document.isCustomerVisible,
            expiresAt: document.expiresAt
              ? document.expiresAt.toISOString()
              : "",
            notes: document.notes ?? "",
          }}
          isEdit
          returnPath={`/customer-portal/documents/${id}`}
        />
      </div>
    </div>
  );
}
