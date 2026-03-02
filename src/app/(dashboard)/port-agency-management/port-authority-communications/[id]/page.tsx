import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortAuthorityCommunication } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  sent: "default",
  received: "default",
  responded: "success",
  closed: "destructive",
} as const;

export default async function PortAuthorityCommunicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const comm = await getPortAuthorityCommunication(id, session.tenantId);
  if (!comm) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/port-authority-communications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {comm.commRef}
          </h1>
          <p className="text-sm text-gray-500">
            {comm.commType} &middot; {comm.authorityName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/port-authority-communications/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Comm Ref</dt>
            <dd className="mt-1 text-gray-900">{comm.commRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Communication Type
            </dt>
            <dd className="mt-1 text-gray-900">{comm.commType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    comm.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {comm.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Authority Name
            </dt>
            <dd className="mt-1 text-gray-900">{comm.authorityName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Authority Department
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.authorityDepartment || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Person
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.contactPerson || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Email
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.contactEmail || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Phone
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.contactPhone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {comm.vesselName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {comm.imoNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.portCallRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">
              {comm.portName || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-gray-900">{comm.subject}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Message Body
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {comm.messageBody || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Direction</dt>
            <dd className="mt-1 text-gray-900">
              {comm.direction || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">
              {comm.priority || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Response Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {comm.responseRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Response Deadline
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(comm.responseDeadline)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {comm.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {comm.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {comm.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
