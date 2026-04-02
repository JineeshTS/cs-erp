import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIspsCompliance } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";

export default async function IspsComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;
  const record = await getIspsCompliance(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/isps-compliances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.ispsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.facilityName || "ISPS Compliance"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customs-compliance-regulatory/isps-compliances/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">ISPS Ref</dt>
            <dd className="mt-1 text-gray-900">{record.ispsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Facility Type</dt>
            <dd className="mt-1 text-gray-900">{record.facilityType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Facility Name</dt>
            <dd className="mt-1 text-gray-900">{record.facilityName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Facility Code</dt>
            <dd className="mt-1 text-gray-900">{record.facilityCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{record.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Security Level</dt>
            <dd className="mt-1 text-gray-900">{record.securityLevel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PFSO Name</dt>
            <dd className="mt-1 text-gray-900">{record.pfsoName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PFSO Contact</dt>
            <dd className="mt-1 text-gray-900">{record.pfsoContact || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SSO Name</dt>
            <dd className="mt-1 text-gray-900">{record.ssoName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Security Plan Ref</dt>
            <dd className="mt-1 text-gray-900">{record.securityPlanRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Security Plan Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.securityPlanApprovedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Drill Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.lastDrillDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Drill Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.nextDrillDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Audit Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.lastAuditDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Audit Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.nextAuditDate?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Audit Result</dt>
            <dd className="mt-1 text-gray-900">{record.auditResult || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ISSC Number</dt>
            <dd className="mt-1 text-gray-900">{record.isscNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ISSC Expires At</dt>
            <dd className="mt-1 text-gray-900">
              {record.isscExpiresAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "non_compliant"
                      ? "destructive"
                      : record.status === "pending"
                        ? "warning"
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
