import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportCode",
    label: "Report Code",
    type: "text",
    required: true,
    placeholder: "CR-2026-001",
  },
  {
    name: "reportName",
    label: "Report Name",
    type: "text",
    required: true,
    placeholder: "Q1 2026 SOC 2 Compliance Report",
  },
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "soc2", label: "SOC 2" },
      { value: "iso27001", label: "ISO 27001" },
      { value: "gdpr", label: "GDPR" },
      { value: "pci_dss", label: "PCI DSS" },
      { value: "hipaa", label: "HIPAA" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    name: "framework",
    label: "Framework",
    type: "text",
    placeholder: "SOC 2 Type II",
  },
  {
    name: "periodStart",
    label: "Period Start",
    type: "datetime-local",
  },
  {
    name: "periodEnd",
    label: "Period End",
    type: "datetime-local",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "in_progress", label: "In Progress" },
      { value: "review", label: "Review" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes about the compliance report...",
  },
];

export default async function NewComplianceReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/compliance-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Compliance Report
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Compliance Report"
          apiPath="/api/v1/infrastructure-security/compliance-reports"
          fields={REPORT_FIELDS}
          returnPath="/infrastructure-security/compliance-reports"
        />
      </div>
    </div>
  );
}
