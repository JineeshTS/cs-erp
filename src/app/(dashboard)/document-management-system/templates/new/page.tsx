import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DmsForm } from "@/components/document-management-system/dms-form";
import type { FieldConfig } from "@/components/document-management-system/dms-form";

const TEMPLATE_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
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
  {
    name: "templateFormat",
    label: "Template Format",
    type: "select",
    options: [
      { value: "html", label: "HTML" },
      { value: "markdown", label: "Markdown" },
      { value: "docx", label: "DOCX" },
      { value: "pdf", label: "PDF" },
    ],
  },
  {
    name: "bodyTemplate",
    label: "Body Template",
    type: "textarea",
    required: true,
  },
  { name: "headerTemplate", label: "Header Template", type: "textarea" },
  { name: "footerTemplate", label: "Footer Template", type: "textarea" },
  {
    name: "outputFormat",
    label: "Output Format",
    type: "select",
    options: [
      { value: "pdf", label: "PDF" },
      { value: "docx", label: "DOCX" },
      { value: "html", label: "HTML" },
    ],
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewTemplatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "templates:create"))
  )
    redirect("/document-management-system/templates");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/templates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Template</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DmsForm
          entityType="Template"
          apiPath="/api/v1/document-management-system/templates"
          fields={TEMPLATE_FIELDS}
          returnPath="/document-management-system/templates"
        />
      </div>
    </div>
  );
}
