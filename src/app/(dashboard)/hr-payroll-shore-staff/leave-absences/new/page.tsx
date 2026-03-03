import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const LEAVE_ABSENCE_FIELDS: FieldConfig[] = [
  {
    name: "leaveType",
    label: "Leave Type",
    type: "select",
    required: true,
    options: [
      { value: "annual", label: "Annual" },
      { value: "sick", label: "Sick" },
      { value: "maternity", label: "Maternity" },
      { value: "paternity", label: "Paternity" },
      { value: "hajj", label: "Hajj" },
      { value: "compassionate", label: "Compassionate" },
      { value: "unpaid", label: "Unpaid" },
      { value: "study", label: "Study" },
    ],
  },
  { name: "employeeRef", label: "Employee Ref", type: "text" },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "startDate", label: "Start Date", type: "datetime-local" },
  { name: "endDate", label: "End Date", type: "datetime-local" },
  { name: "totalDays", label: "Total Days", type: "text" },
  { name: "reason", label: "Reason", type: "textarea" },
  { name: "approver", label: "Approver", type: "text" },
  { name: "isHalfDay", label: "Half Day", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLeaveAbsencePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "hr:create"))
  )
    redirect("/hr-payroll-shore-staff/leave-absences");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/leave-absences"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Leave Request
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Leave Request"
          apiPath="/api/v1/hr-payroll-shore-staff/leave-absences"
          fields={LEAVE_ABSENCE_FIELDS}
          returnPath="/hr-payroll-shore-staff/leave-absences"
        />
      </div>
    </div>
  );
}
