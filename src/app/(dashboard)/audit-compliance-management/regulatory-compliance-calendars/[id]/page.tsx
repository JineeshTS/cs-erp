import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRegulatoryComplianceCalendar } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function statusBadgeVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "overdue") return "destructive" as const;
  if (status === "cancelled") return "destructive" as const;
  if (status === "in_progress") return "warning" as const;
  return "secondary" as const;
}

export default async function RegulatoryComplianceCalendarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "audit:edit"
  );

  const { id } = await params;
  const record = await getRegulatoryComplianceCalendar(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/regulatory-compliance-calendars"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.title}
            </h1>
            <p className="text-sm text-gray-500">{record.calendarRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/regulatory-compliance-calendars/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Calendar Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.calendarRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Compliance Type
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.complianceType}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Regulation</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.regulation || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Authority</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.authority || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Jurisdiction</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.jurisdiction || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Frequency</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.frequency || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reminder Days</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.reminderDays ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Responsible Person
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.responsiblePerson || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Responsible Department
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.responsibleDepartment || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Completion Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.completionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Next Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.nextDueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Is Recurring</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.isRecurring ? "Yes" : "No"}
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
