import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPreArrivalChecklist } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  pending: "secondary",
  in_progress: "default",
  completed: "success",
  overdue: "destructive",
} as const;

export default async function PreArrivalChecklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const checklist = await getPreArrivalChecklist(id, session.tenantId);
  if (!checklist) notFound();

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
          href="/port-agency-management/pre-arrival-checklists"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {checklist.checklistRef}
          </h1>
          <p className="text-sm text-gray-500">
            {checklist.checklistType} &middot; {checklist.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/pre-arrival-checklists/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Checklist Ref
            </dt>
            <dd className="mt-1 text-gray-900">{checklist.checklistRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Checklist Type
            </dt>
            <dd className="mt-1 text-gray-900">{checklist.checklistType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    checklist.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {checklist.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{checklist.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.imoNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {checklist.portCallRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.portName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Arrival Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(checklist.arrivalDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Documents Due
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(checklist.documentsDue)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Count</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.totalCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Authority Notified
            </dt>
            <dd className="mt-1 text-gray-900">
              {checklist.portAuthorityNotified ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customs Notified
            </dt>
            <dd className="mt-1 text-gray-900">
              {checklist.customsNotified ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Immigration Notified
            </dt>
            <dd className="mt-1 text-gray-900">
              {checklist.immigrationNotified ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Health Authority Notified
            </dt>
            <dd className="mt-1 text-gray-900">
              {checklist.healthAuthorityNotified ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.assignedTo || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {checklist.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {checklist.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
