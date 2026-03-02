import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCertificateTracking } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CertificateTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;

  const record = await getCertificateTracking(id, session.tenantId);
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
          href="/crew-management/certificate-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.certificateRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.crewMemberName} &middot; {record.certificateName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/crew-management/certificate-trackings/${id}/edit`}
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
              Crew Member Name
            </dt>
            <dd className="mt-1 text-gray-900">{record.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rank</dt>
            <dd className="mt-1 text-gray-900">{record.rank || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.certificateType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Name
            </dt>
            <dd className="mt-1 text-gray-900">{record.certificateName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Issuing Authority
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.issuingAuthority || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Issuing Country
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.issuingCountry || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.issueDate
                ? new Date(record.issueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              STCW Regulation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.stcwRegulation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Competency Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.competencyLevel || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Revalidation Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.revalidationRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Revalidation Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.revalidationDate
                ? new Date(record.revalidationDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "valid"
                    ? "success"
                    : record.status === "expired" ||
                        record.status === "revoked" ||
                        record.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
