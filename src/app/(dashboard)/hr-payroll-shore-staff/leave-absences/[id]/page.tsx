import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeaveAbsence } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

export default async function LeaveAbsenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/hr-payroll-shore-staff");

  const { id } = await params;
  const record = await getLeaveAbsence(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "hr:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/leave-absences"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.employeeName} - {record.leaveType}
          </h1>
          <p className="text-sm text-gray-500">{record.leaveRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/hr-payroll-shore-staff/leave-absences/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Leave Ref</dt>
            <dd className="mt-1 text-gray-900">{record.leaveRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Leave Type</dt>
            <dd className="mt-1 text-gray-900">{record.leaveType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.employeeRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Employee Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.employeeName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.startDate
                ? new Date(record.startDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.endDate
                ? new Date(record.endDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Days</dt>
            <dd className="mt-1 text-gray-900">{record.totalDays ?? "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-gray-900">{record.reason || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approver</dt>
            <dd className="mt-1 text-gray-900">{record.approver || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approval Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Leave Balance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.leaveBalance ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Half Day</dt>
            <dd className="mt-1 text-gray-900">
              {record.isHalfDay ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Rejection Reason
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.rejectionReason || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected" ||
                        record.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
