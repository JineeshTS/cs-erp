import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIsoCertificationTracking } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function statusBadgeVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "expired") return "destructive" as const;
  if (status === "suspended") return "warning" as const;
  return "secondary" as const;
}

export default async function IsoCertificationTrackingDetailPage({
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
  const record = await getIsoCertificationTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/iso-certification-trackings"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.standard}
            </h1>
            <p className="text-sm text-gray-500">{record.certificationRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/iso-certification-trackings/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Certification Ref
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certificationRef}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Standard</p>
            <p className="mt-1 text-sm text-gray-900">{record.standard}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Certification Type
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certificationType || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Scope</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.scope || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Certifying Body</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certifyingBody || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Certificate Number
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.certificateNumber || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Issue Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.issueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expiry Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.expiryDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Renewal Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.renewalDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Last Surveillance Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.lastSurveillanceDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Next Surveillance Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.nextSurveillanceDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Non-Conformities
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.nonConformities ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Major Non-Conformities
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.majorNonConformities ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Document URL</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.documentUrl || "-"}
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
