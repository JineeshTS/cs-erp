import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "auditType",
    label: "Audit Type",
    type: "select",
    required: true,
    options: [
      { value: "financial", label: "Financial" },
      { value: "operational", label: "Operational" },
      { value: "compliance", label: "Compliance" },
      { value: "system", label: "System" },
      { value: "special", label: "Special" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "scope", label: "Scope", type: "textarea" },
  { name: "objective", label: "Objective", type: "textarea" },
  { name: "leadAuditor", label: "Lead Auditor", type: "text" },
  { name: "department", label: "Department", type: "text" },
  {
    name: "plannedStartDate",
    label: "Planned Start Date",
    type: "datetime-local",
  },
  {
    name: "plannedEndDate",
    label: "Planned End Date",
    type: "datetime-local",
  },
  {
    name: "actualStartDate",
    label: "Actual Start Date",
    type: "datetime-local",
  },
  {
    name: "actualEndDate",
    label: "Actual End Date",
    type: "datetime-local",
  },
  { name: "totalFindings", label: "Total Findings", type: "number" },
  { name: "criticalFindings", label: "Critical Findings", type: "number" },
  {
    name: "riskRating",
    label: "Risk Rating",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewInternalAuditPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/audit-compliance-management/internal-audits"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Internal Audit
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Internal Audit"
          apiPath="/api/v1/audit-compliance-management/internal-audits"
          fields={fields}
          returnPath="/audit-compliance-management/internal-audits"
        />
      </div>
    </div>
  );
}
