import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSoxFinancialControl } from "@/lib/audit-compliance-management/service";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "controlType",
    label: "Control Type",
    type: "select",
    required: true,
    options: [
      { value: "preventive", label: "Preventive" },
      { value: "detective", label: "Detective" },
      { value: "corrective", label: "Corrective" },
      { value: "compensating", label: "Compensating" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "controlObjective",
    label: "Control Objective",
    type: "textarea",
  },
  { name: "processArea", label: "Process Area", type: "text" },
  { name: "controlOwner", label: "Control Owner", type: "text" },
  {
    name: "controlFrequency",
    label: "Control Frequency",
    type: "select",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
    ],
  },
  { name: "testProcedure", label: "Test Procedure", type: "textarea" },
  { name: "testFrequency", label: "Test Frequency", type: "text" },
  {
    name: "lastTestDate",
    label: "Last Test Date",
    type: "datetime-local",
  },
  {
    name: "nextTestDate",
    label: "Next Test Date",
    type: "datetime-local",
  },
  {
    name: "testResult",
    label: "Test Result",
    type: "select",
    options: [
      { value: "effective", label: "Effective" },
      { value: "ineffective", label: "Ineffective" },
      { value: "partially_effective", label: "Partially Effective" },
    ],
  },
  {
    name: "deficiencyLevel",
    label: "Deficiency Level",
    type: "select",
    options: [
      { value: "none", label: "None" },
      { value: "deficiency", label: "Deficiency" },
      { value: "significant_deficiency", label: "Significant Deficiency" },
      { value: "material_weakness", label: "Material Weakness" },
    ],
  },
  { name: "remediationPlan", label: "Remediation Plan", type: "textarea" },
  {
    name: "remediationDueDate",
    label: "Remediation Due Date",
    type: "datetime-local",
  },
  {
    name: "riskRating",
    label: "Risk Rating",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  { name: "keyControl", label: "Key Control", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSoxFinancialControlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getSoxFinancialControl(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/audit-compliance-management/sox-financial-controls/${id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit SOX Financial Control
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="SOX Control"
          apiPath={`/api/v1/audit-compliance-management/sox-financial-controls/${id}`}
          fields={fields}
          initialData={{
            controlType: record.controlType,
            title: record.title,
            controlObjective: record.controlObjective ?? "",
            processArea: record.processArea ?? "",
            controlOwner: record.controlOwner ?? "",
            controlFrequency: record.controlFrequency ?? "",
            testProcedure: record.testProcedure ?? "",
            testFrequency: record.testFrequency ?? "",
            lastTestDate: record.lastTestDate
              ? record.lastTestDate.toISOString()
              : "",
            nextTestDate: record.nextTestDate
              ? record.nextTestDate.toISOString()
              : "",
            testResult: record.testResult ?? "",
            deficiencyLevel: record.deficiencyLevel ?? "",
            remediationPlan: record.remediationPlan ?? "",
            remediationDueDate: record.remediationDueDate
              ? record.remediationDueDate.toISOString()
              : "",
            riskRating: record.riskRating ?? "",
            keyControl: record.keyControl ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/audit-compliance-management/sox-financial-controls/${id}`}
        />
      </div>
    </div>
  );
}
