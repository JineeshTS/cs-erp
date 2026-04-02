import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getEmployeeProfile } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

export default async function EmployeeProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/hr-payroll-shore-staff");

  const { id } = await params;
  const record = await getEmployeeProfile(id, session.tenantId);
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
          href="/hr-payroll-shore-staff/employee-profiles"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.firstName} {record.lastName}
          </h1>
          <p className="text-sm text-gray-500">{record.employeeRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/hr-payroll-shore-staff/employee-profiles/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Employee Ref</dt>
            <dd className="mt-1 text-gray-900">{record.employeeRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">First Name</dt>
            <dd className="mt-1 text-gray-900">{record.firstName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
            <dd className="mt-1 text-gray-900">{record.lastName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Employee Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.employeeType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-gray-900">{record.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-gray-900">{record.phone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">National ID</dt>
            <dd className="mt-1 text-gray-900">{record.nationalId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Passport Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.passportNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-gray-900">
              {record.nationality || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Date of Birth
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dateOfBirth
                ? new Date(record.dateOfBirth).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-gray-900">{record.gender || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Marital Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.maritalStatus || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-gray-900">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Designation</dt>
            <dd className="mt-1 text-gray-900">{record.designation || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Grade</dt>
            <dd className="mt-1 text-gray-900">{record.grade || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Manager
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingManager || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Join Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.joinDate
                ? new Date(record.joinDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Probation End Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.probationEndDate
                ? new Date(record.probationEndDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Basic Salary</dt>
            <dd className="mt-1 text-gray-900">
              {record.basicSalary ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Salary Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.salaryCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-gray-900">{record.bankName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IBAN</dt>
            <dd className="mt-1 text-gray-900">{record.iban || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "terminated" ||
                        record.status === "resigned"
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
