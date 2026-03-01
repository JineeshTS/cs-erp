import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";

export default async function NewOcrExtractionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/accounts-payable-vendor-management/ocr-extractions");

  const fields: FieldConfig[] = [
    { name: "fileName", label: "File Name", type: "text", required: true },
    {
      name: "fileType",
      label: "File Type",
      type: "select",
      required: true,
      options: [
        { value: "pdf", label: "PDF" },
        { value: "jpg", label: "JPG" },
        { value: "png", label: "PNG" },
        { value: "tiff", label: "TIFF" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "fileSize", label: "File Size", type: "number" },
    { name: "documentId", label: "Document ID", type: "text" },
    { name: "vendorName", label: "Vendor Name", type: "text" },
    { name: "aiModelVersion", label: "AI Model Version", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/accounts-payable-vendor-management/ocr-extractions"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New OCR Extraction
          </h1>
          <p className="text-sm text-gray-500">
            Create a new OCR extraction record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="OCR Extraction"
          apiPath="/api/v1/accounts-payable-vendor-management/ocr-extractions"
          fields={fields}
          returnPath="/accounts-payable-vendor-management/ocr-extractions"
        />
      </div>
    </div>
  );
}
