import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getManningAgency } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">{status}</Badge>;
    case "terminated":
    case "suspended":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function ManningAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getManningAgency(id, session.tenantId);
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
          href="/crew-management/manning-agencies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.agencyName}
          </h1>
          <p className="text-sm text-gray-500">{record.agencyRef}</p>
        </div>
        {canEdit && (
          <Link
            href={`/crew-management/manning-agencies/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Agency Name</dt>
            <dd className="mt-1 text-gray-900">{record.agencyName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">{record.country ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-gray-900">{record.city ?? "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-gray-900">{record.address ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Person
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactPerson ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Email
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactEmail ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Phone
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactPhone ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              License Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.licenseNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              License Expiry
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.licenseExpiry
                ? new Date(record.licenseExpiry).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Active Crew Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.activeCrewCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Performance Rating
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.performanceRating ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contract Start Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contractStartDate
                ? new Date(record.contractStartDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contract End Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contractEndDate
                ? new Date(record.contractEndDate).toLocaleDateString()
                : "-"}
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
