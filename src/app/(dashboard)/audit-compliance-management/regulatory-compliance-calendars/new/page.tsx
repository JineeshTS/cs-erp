import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "complianceType",
    label: "Compliance Type",
    type: "select",
    required: true,
    options: [
      { value: "regulatory_filing", label: "Regulatory Filing" },
      { value: "license_renewal", label: "License Renewal" },
      { value: "permit_renewal", label: "Permit Renewal" },
      { value: "inspection", label: "Inspection" },
      { value: "certification", label: "Certification" },
      { value: "reporting", label: "Reporting" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "regulation", label: "Regulation", type: "text" },
  { name: "authority", label: "Authority", type: "text" },
  { name: "jurisdiction", label: "Jurisdiction", type: "text" },
  {
    name: "frequency",
    label: "Frequency",
    type: "select",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
      { value: "one_time", label: "One Time" },
    ],
  },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  { name: "reminderDays", label: "Reminder Days", type: "number" },
  { name: "responsiblePerson", label: "Responsible Person", type: "text" },
  {
    name: "responsibleDepartment",
    label: "Responsible Department",
    type: "text",
  },
  { name: "isRecurring", label: "Is Recurring", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRegulatoryComplianceCalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/audit-compliance-management/regulatory-compliance-calendars"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Regulatory Compliance Calendar Entry
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Regulatory Compliance Calendar"
          apiPath="/api/v1/audit-compliance-management/regulatory-compliance-calendars"
          fields={fields}
          returnPath="/audit-compliance-management/regulatory-compliance-calendars"
        />
      </div>
    </div>
  );
}
