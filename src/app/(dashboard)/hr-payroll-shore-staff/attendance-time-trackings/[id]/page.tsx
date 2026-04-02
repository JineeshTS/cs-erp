import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAttendanceTimeTracking } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusBadgeVariant(status: string) {
  if (status === "completed" || status === "approved")
    return "success" as const;
  if (status === "cancelled" || status === "rejected")
    return "destructive" as const;
  if (status === "in_progress" || status === "pending")
    return "warning" as const;
  return "secondary" as const;
}

export default async function AttendanceTimeTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "hr:edit"
  );

  const { id } = await params;
  const record = await getAttendanceTimeTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/hr-payroll-shore-staff/attendance-time-trackings"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.attendanceRef}
            </h1>
            <p className="text-sm text-gray-500">
              {record.employeeName || "Attendance Time Tracking"}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/hr-payroll-shore-staff/attendance-time-trackings/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Attendance Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.attendanceRef}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Attendance Type
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.attendanceType}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Employee Ref</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.employeeRef || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Employee Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.employeeName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Attendance Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.attendanceDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Check In Time</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDateTime(record.checkInTime)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Check Out Time</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDateTime(record.checkOutTime)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Work Hours</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.workHours || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Overtime Hours</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.overtimeHours || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Break Hours</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.breakHours || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Location</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.location || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Shift Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.shiftName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Is Late</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.isLate ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Late Minutes</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.lateMinutes ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Is Early Leave</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.isEarlyLeave ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Early Leave Minutes
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.earlyLeaveMinutes ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
