import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const LESSON_LEARNED_FIELDS: FieldConfig[] = [
  {
    name: "lessonType",
    label: "Lesson Type",
    type: "select",
    required: true,
    options: [
      { value: "incident_review", label: "Incident Review" },
      { value: "project_retrospective", label: "Project Retrospective" },
      { value: "process_improvement", label: "Process Improvement" },
      { value: "near_miss", label: "Near Miss" },
      { value: "best_practice", label: "Best Practice" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "incidentDate", label: "Incident Date", type: "datetime-local" },
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "lessonDescription", label: "Lesson Description", type: "textarea" },
  { name: "recommendation", label: "Recommendation", type: "textarea" },
  { name: "impactLevel", label: "Impact Level", type: "text" },
  { name: "implemented", label: "Implemented", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLessonLearnedPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "kmt:create"))
  )
    redirect("/knowledge-management-training/lessons-learned");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/lessons-learned"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Lesson Learned
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Lesson Learned"
          apiPath="/api/v1/knowledge-management-training/lessons-learned"
          fields={LESSON_LEARNED_FIELDS}
          returnPath="/knowledge-management-training/lessons-learned"
        />
      </div>
    </div>
  );
}
