import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const COMPETENCY_ASSESSMENT_FIELDS: FieldConfig[] = [
  {
    name: "assessmentType",
    label: "Assessment Type",
    type: "select",
    required: true,
    options: [
      { value: "skills_evaluation", label: "Skills Evaluation" },
      { value: "knowledge_test", label: "Knowledge Test" },
      { value: "performance_review", label: "Performance Review" },
      { value: "certification_exam", label: "Certification Exam" },
      { value: "gap_analysis", label: "Gap Analysis" },
    ],
  },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "employeeId", label: "Employee ID", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "competencyArea", label: "Competency Area", type: "text" },
  { name: "currentLevel", label: "Current Level", type: "number" },
  { name: "targetLevel", label: "Target Level", type: "number" },
  { name: "scorePct", label: "Score (%)", type: "text" },
  { name: "assessedDate", label: "Assessed Date", type: "datetime-local" },
  { name: "nextAssessmentDate", label: "Next Assessment Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCompetencyAssessmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "kmt:create"))
  )
    redirect("/knowledge-management-training/competency-assessments");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/competency-assessments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Competency Assessment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Competency Assessment"
          apiPath="/api/v1/knowledge-management-training/competency-assessments"
          fields={COMPETENCY_ASSESSMENT_FIELDS}
          returnPath="/knowledge-management-training/competency-assessments"
        />
      </div>
    </div>
  );
}
