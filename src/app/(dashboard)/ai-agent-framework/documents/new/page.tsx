import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const DOC_JOB_FIELDS: FieldConfig[] = [
  { name: "jobReference", label: "Job Reference", type: "text", required: true, placeholder: "DOC-JOB-001" },
  { name: "documentRef", label: "Document Reference", type: "text", placeholder: "DOC-REF-001" },
  { name: "documentType", label: "Document Type", type: "text", required: true, placeholder: "bill_of_lading" },
  { name: "jobType", label: "Job Type", type: "select", required: true, options: [
    { value: "ocr", label: "OCR" },
    { value: "extraction", label: "Extraction" },
    { value: "classification", label: "Classification" },
    { value: "validation", label: "Validation" },
    { value: "translation", label: "Translation" },
  ]},
  { name: "priority", label: "Priority", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]},
  { name: "ocrEngine", label: "OCR Engine", type: "text", placeholder: "tesseract" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDocumentJobPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:create")))
    redirect("/ai-agent-framework/documents");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework/documents" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Document Processing Job</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Document Processing Job"
          apiPath="/api/v1/ai-agent-framework/documents/process"
          fields={DOC_JOB_FIELDS}
          returnPath="/ai-agent-framework/documents"
        />
      </div>
    </div>
  );
}
