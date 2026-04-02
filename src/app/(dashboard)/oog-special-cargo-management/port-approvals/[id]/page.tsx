import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortApproval } from "@/lib/oog-special-cargo-management/service";
import { Badge } from "@/components/ui/badge";

export default async function PortApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/oog-special-cargo-management");

  const { id } = await params;
  const record = await getPortApproval(id, session.tenantId);
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
          href="/oog-special-cargo-management/port-approvals"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.portName} - {record.approvalType}
          </h1>
          <p className="text-sm text-gray-500">{record.approvalRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/oog-special-cargo-management/port-approvals/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Approval Ref</dt>
            <dd className="mt-1 text-gray-900">{record.approvalRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acceptance Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.acceptanceRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{record.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Authority
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.portAuthority || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Voyage Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageNumber || "-"}
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
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Weight (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.grossWeightKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approval Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.approvalType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
            <dd className="mt-1 text-gray-900">
              {record.submittedAt
                ? new Date(record.submittedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
            <dd className="mt-1 text-gray-900">
              {record.submittedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Application Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.applicationNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approved By Authority
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedByAuthority || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Rejection Reason
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.rejectionReason || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valid From</dt>
            <dd className="mt-1 text-gray-900">
              {record.validFrom
                ? new Date(record.validFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valid To</dt>
            <dd className="mt-1 text-gray-900">
              {record.validTo
                ? new Date(record.validTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fees</dt>
            <dd className="mt-1 text-gray-900">{record.fees ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
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
