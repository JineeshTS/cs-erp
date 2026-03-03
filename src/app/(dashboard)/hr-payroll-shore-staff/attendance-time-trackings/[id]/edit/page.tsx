import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAttendanceTimeTracking } from "@/lib/hr-payroll-shore-staff/service";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const fields: FieldConfig[] = [
  {
    name: "attendanceType",
    label: "Attendance Type",
    type: "select",
    required: true,
    options: [
      { value: "regular", label: "Regular" },
      { value: "overtime", label: "Overtime" },
      { value: "remote", label: "Remote" },
      { value: "field", label: "Field" },
      { value: "shift", label: "Shift" },
    ],
  },
  { name: "employeeRef", label: "Employee Ref", type: "text" },
  { name: "employeeName", label: "Employee Name", type: "text" },
  {
    name: "attendanceDate",
    label: "Attendance Date",
    type: "datetime-local",
  },
  { name: "checkInTime", label: "Check In Time", type: "datetime-local" },
  { name: "checkOutTime", label: "Check Out Time", type: "datetime-local" },
  { name: "workHours", label: "Work Hours", type: "text" },
  { name: "overtimeHours", label: "Overtime Hours", type: "text" },
  { name: "breakHours", label: "Break Hours", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "shiftName", label: "Shift Name", type: "text" },
  { name: "isLate", label: "Is Late", type: "checkbox" },
  { name: "lateMinutes", label: "Late Minutes", type: "number" },
  { name: "isEarlyLeave", label: "Is Early Leave", type: "checkbox" },
  {
    name: "earlyLeaveMinutes",
    label: "Early Leave Minutes",
    type: "number",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAttendanceTimeTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getAttendanceTimeTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/hr-payroll-shore-staff/attendance-time-trackings/${id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Attendance Time Tracking
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Attendance Time Tracking"
          apiPath={`/api/v1/hr-payroll-shore-staff/attendance-time-trackings/${id}`}
          fields={fields}
          initialData={record as Record<string, unknown>}
          isEdit
          returnPath={`/hr-payroll-shore-staff/attendance-time-trackings/${id}`}
        />
      </div>
    </div>
  );
}
