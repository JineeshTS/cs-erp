import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVisaTravelRecord } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">{status}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function VisaTravelRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getVisaTravelRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "crew:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/crew-management/visa-travel-records"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.crewMemberName}
          </h1>
          <p className="text-sm text-gray-500">{record.recordRef}</p>
        </div>
        {canEdit && (
          <Link
            href={`/crew-management/visa-travel-records/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Crew Member Name
            </dt>
            <dd className="mt-1 text-gray-900">{record.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-gray-900">
              {record.nationality ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Record Type</dt>
            <dd className="mt-1 text-gray-900">{record.recordType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Type</dt>
            <dd className="mt-1 text-gray-900">{record.visaType ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Country</dt>
            <dd className="mt-1 text-gray-900">
              {record.visaCountry ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.visaNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Visa Issue Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.visaIssueDate
                ? new Date(record.visaIssueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Visa Expiry Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.visaExpiryDate
                ? new Date(record.visaExpiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Travel Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.travelDate
                ? new Date(record.travelDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Travel From</dt>
            <dd className="mt-1 text-gray-900">
              {record.travelFrom ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Travel To</dt>
            <dd className="mt-1 text-gray-900">{record.travelTo ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Flight Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.flightNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Airline</dt>
            <dd className="mt-1 text-gray-900">{record.airline ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Ticket Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.ticketNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ticket Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.ticketCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Repatriation Reason
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.repatriationReason ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Repatriation Port
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.repatriationPort ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Arranged By</dt>
            <dd className="mt-1 text-gray-900">
              {record.arrangedByName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedByName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
