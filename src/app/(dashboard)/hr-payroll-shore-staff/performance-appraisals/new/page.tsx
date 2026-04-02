import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const fields: FieldConfig[] = [
  {
    name: "appraisalType",
    label: "Appraisal Type",
    type: "select",
    required: true,
    options: [
      { value: "annual", label: "Annual" },
      { value: "mid_year", label: "Mid Year" },
      { value: "quarterly", label: "Quarterly" },
      { value: "probation", label: "Probation" },
      { value: "360_degree", label: "360 Degree" },
    ],
  },
  { name: "employeeRef", label: "Employee Ref", type: "text" },
  { name: "employeeName", label: "Employee Name", type: "text" },
  {
    name: "reviewPeriodStart",
    label: "Review Period Start",
    type: "datetime-local",
  },
  {
    name: "reviewPeriodEnd",
    label: "Review Period End",
    type: "datetime-local",
  },
  { name: "reviewer", label: "Reviewer", type: "text" },
  {
    name: "reviewerDesignation",
    label: "Reviewer Designation",
    type: "text",
  },
  { name: "overallScore", label: "Overall Score", type: "text" },
  {
    name: "overallRating",
    label: "Overall Rating",
    type: "select",
    options: [
      { value: "exceptional", label: "Exceptional" },
      { value: "exceeds", label: "Exceeds" },
      { value: "meets", label: "Meets" },
      { value: "needs_improvement", label: "Needs Improvement" },
      { value: "unsatisfactory", label: "Unsatisfactory" },
    ],
  },
  { name: "strengths", label: "Strengths", type: "textarea" },
  {
    name: "areasForImprovement",
    label: "Areas for Improvement",
    type: "textarea",
  },
  {
    name: "promotionRecommendation",
    label: "Promotion Recommendation",
    type: "checkbox",
  },
  { name: "salaryRevision", label: "Salary Revision", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPerformanceAppraisalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/performance-appraisals"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Performance Appraisal
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Performance Appraisal"
          apiPath="/api/v1/hr-payroll-shore-staff/performance-appraisals"
          fields={fields}
          returnPath="/hr-payroll-shore-staff/performance-appraisals"
        />
      </div>
    </div>
  );
}
