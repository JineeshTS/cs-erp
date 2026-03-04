import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getKnowledgeAssistant } from "@/lib/knowledge-management-training/service";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const KNOWLEDGE_ASSISTANT_FIELDS: FieldConfig[] = [
  {
    name: "assistantType",
    label: "Assistant Type",
    type: "select",
    required: true,
    options: [
      { value: "search_query", label: "Search Query" },
      { value: "faq_response", label: "FAQ Response" },
      { value: "document_summary", label: "Document Summary" },
      { value: "process_guide", label: "Process Guide" },
      { value: "recommendation", label: "Recommendation" },
    ],
  },
  { name: "query", label: "Query", type: "textarea" },
  { name: "response", label: "Response", type: "textarea" },
  { name: "sourceDocs", label: "Source Docs", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "feedbackRating", label: "Feedback Rating", type: "number" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "responseTimeMs", label: "Response Time (ms)", type: "number" },
  { name: "helpful", label: "Helpful", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditKnowledgeAssistantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:edit")))
    redirect("/knowledge-management-training/knowledge-assistants");

  const { id } = await params;

  const record = await getKnowledgeAssistant(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/knowledge-management-training/knowledge-assistants/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Knowledge Assistant
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Knowledge Assistant"
          apiPath={`/api/v1/knowledge-management-training/knowledge-assistants/${id}`}
          fields={KNOWLEDGE_ASSISTANT_FIELDS}
          initialData={{
            assistantType: record.assistantType,
            query: record.query ?? "",
            response: record.response ?? "",
            sourceDocs: record.sourceDocs ?? "",
            confidenceScore: record.confidenceScore ?? "",
            feedbackRating: record.feedbackRating ?? "",
            modelVersion: record.modelVersion ?? "",
            responseTimeMs: record.responseTimeMs ?? "",
            helpful: record.helpful ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/knowledge-management-training/knowledge-assistants/${id}`}
        />
      </div>
    </div>
  );
}
