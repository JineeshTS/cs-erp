import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewKnowledgeAssistantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "kmt:create"))
  )
    redirect("/knowledge-management-training/knowledge-assistants");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/knowledge-assistants"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Knowledge Assistant
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Knowledge Assistant"
          apiPath="/api/v1/knowledge-management-training/knowledge-assistants"
          fields={KNOWLEDGE_ASSISTANT_FIELDS}
          returnPath="/knowledge-management-training/knowledge-assistants"
        />
      </div>
    </div>
  );
}
