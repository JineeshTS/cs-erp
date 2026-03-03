import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPolicyProcedure } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PolicyProcedureDetailPage({
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
  const record = await getPolicyProcedure(id, session.tenantId);
  if (!record) notFound();

  function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  function statusVariant(s: string) {
    if (s === "active") return "success" as const;
    if (s === "expired") return "destructive" as const;
    if (s === "under_review") return "warning" as const;
    if (s === "archived") return "secondary" as const;
    return "default" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/policy-procedures"
            className="rounded-md border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.policyRef}
            </h1>
            <p className="text-sm text-gray-500">{record.title}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/policy-procedures/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Policy Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.policyRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Policy Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.policyType || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Version</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.version || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Category</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.category || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Department</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.department || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Author</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.author || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approver</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.approver || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Approval Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.approvalDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Effective Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.effectiveDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Review Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reviewDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expiry Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.expiryDate)}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Document URL</p>
            {record.documentUrl ? (
              <a
                href={record.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-blue-600 hover:underline"
              >
                {record.documentUrl}
              </a>
            ) : (
              <p className="mt-1 text-sm text-gray-900">-</p>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Summary</p>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {record.summary || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Acknowledgment Count
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.acknowledgmentCount ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Distributed
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.totalDistributed ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
