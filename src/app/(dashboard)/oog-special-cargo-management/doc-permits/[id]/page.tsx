import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDocPermit } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

export default async function DocPermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;
  const record = await getDocPermit(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "oog_special:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/doc-permits"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.documentTitle || record.documentRef}
          </h1>
          <p className="text-sm text-gray-500">{record.documentRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/oog-special-cargo-management/doc-permits/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Document Ref</dt>
            <dd className="mt-1 text-gray-900">{record.documentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.documentType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Acceptance Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.acceptanceRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Document Title
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.documentTitle || "-"}
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
              Permit Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.permitNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Permit Scope</dt>
            <dd className="mt-1 text-gray-900">
              {record.permitScope || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port of Applicability
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.portOfApplicability || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Country of Applicability
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.countryOfApplicability || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Conditions of Approval
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.conditionsOfApproval || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.documentUrl ? (
                <a
                  href={record.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {record.documentUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified By</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified At</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedAt
                ? new Date(record.verifiedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Renewal Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.renewalRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Renewal Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.renewalDate
                ? new Date(record.renewalDate).toLocaleDateString()
                : "-"}
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
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected" ||
                        record.status === "expired"
                      ? "destructive"
                      : record.status === "submitted"
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
