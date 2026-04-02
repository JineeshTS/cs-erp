import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAeoCompliance } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";

export default async function AeoComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;
  const record = await getAeoCompliance(id, session.tenantId);
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
          href="/customs-compliance-regulatory/aeo-compliances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.aeoRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.companyName || "AEO Compliance"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customs-compliance-regulatory/aeo-compliances/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">AEO Ref</dt>
            <dd className="mt-1 text-gray-900">{record.aeoRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AEO Type</dt>
            <dd className="mt-1 text-gray-900">{record.aeoType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-gray-900">{record.companyName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Registration</dt>
            <dd className="mt-1 text-gray-900">{record.companyRegistration || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Authority Name</dt>
            <dd className="mt-1 text-gray-900">{record.authorityName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Certificate Number</dt>
            <dd className="mt-1 text-gray-900">{record.certificateNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Certificate Issued At</dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateIssuedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Certificate Expires At</dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateExpiresAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Audit Frequency</dt>
            <dd className="mt-1 text-gray-900">{record.auditFrequency || "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Compliance Score</dt>
            <dd className="mt-1 text-gray-900">{record.complianceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Category</dt>
            <dd className="mt-1 text-gray-900">{record.riskCategory || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
            <dd className="mt-1 text-gray-900">{record.contactName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
            <dd className="mt-1 text-gray-900">{record.contactEmail || "-"}</dd>
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
                    : record.status === "revoked"
                      ? "destructive"
                      : record.status === "suspended"
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
