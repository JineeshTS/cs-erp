import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const BI_REPORT_FIELDS: FieldConfig[] = [
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    required: true,
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "ad_hoc", label: "Ad Hoc" },
      { value: "triggered", label: "Triggered" },
      { value: "custom", label: "Custom" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "templateName", label: "Template Name", type: "text" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "financial", label: "Financial" },
      { value: "operational", label: "Operational" },
      { value: "commercial", label: "Commercial" },
      { value: "executive", label: "Executive" },
    ],
  },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  {
    name: "schedule",
    label: "Schedule",
    type: "select",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
    ],
  },
  {
    name: "outputFormat",
    label: "Output Format",
    type: "select",
    options: [
      { value: "pdf", label: "PDF" },
      { value: "xlsx", label: "XLSX" },
      { value: "csv", label: "CSV" },
      { value: "html", label: "HTML" },
    ],
  },
  { name: "isPublished", label: "Published", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewBiReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/bi-reports");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/bi-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New BI Report</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="BI Report"
          apiPath="/api/v1/analytics-business-intelligence/bi-reports"
          fields={BI_REPORT_FIELDS}
          returnPath="/analytics-business-intelligence/bi-reports"
        />
      </div>
    </div>
  );
}
