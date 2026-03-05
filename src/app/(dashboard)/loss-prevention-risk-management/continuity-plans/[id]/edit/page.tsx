import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getContinuityPlan } from "@/lib/loss-prevention-risk-management/service";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const CONTINUITY_PLAN_FIELDS: FieldConfig[] = [
  {
    name: "planType",
    label: "Plan Type",
    type: "select",
    required: true,
    options: [
      { value: "bcp", label: "BCP" },
      { value: "ddr", label: "DDR" },
      { value: "pandemic", label: "Pandemic" },
      { value: "cyber_incident", label: "Cyber Incident" },
      { value: "supply_chain", label: "Supply Chain" },
      { value: "crisis_communication", label: "Crisis Communication" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "scope", label: "Scope", type: "textarea" },
  { name: "rtoHours", label: "RTO (Hours)", type: "number" },
  { name: "rpoHours", label: "RPO (Hours)", type: "number" },
  { name: "criticalProcesses", label: "Critical Processes", type: "textarea" },
  { name: "recoverySteps", label: "Recovery Steps", type: "textarea" },
  { name: "testDate", label: "Test Date", type: "datetime-local" },
  { name: "testResult", label: "Test Result", type: "text" },
  { name: "nextReviewDate", label: "Next Review Date", type: "datetime-local" },
  { name: "planOwner", label: "Plan Owner", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditContinuityPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/continuity-plans");

  const { id } = await params;

  const record = await getContinuityPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/continuity-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Continuity Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Continuity Plan"
          apiPath={`/api/v1/loss-prevention-risk-management/continuity-plans/${id}`}
          fields={CONTINUITY_PLAN_FIELDS}
          initialData={{
            planType: record.planType,
            title: record.title ?? "",
            scope: record.scope ?? "",
            rtoHours: record.rtoHours ?? "",
            rpoHours: record.rpoHours ?? "",
            criticalProcesses: record.criticalProcesses ?? "",
            recoverySteps: record.recoverySteps ?? "",
            testDate: record.testDate ? record.testDate.toISOString().slice(0, 16) : "",
            testResult: record.testResult ?? "",
            nextReviewDate: record.nextReviewDate ? record.nextReviewDate.toISOString().slice(0, 16) : "",
            planOwner: record.planOwner ?? "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/continuity-plans/${id}`}
        />
      </div>
    </div>
  );
}
