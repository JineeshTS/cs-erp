import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAssetDisposal } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

export default async function AssetDisposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getAssetDisposal(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/fixed-assets-management/asset-disposals"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.disposalRef}
            </h1>
            <p className="text-sm text-gray-500">{record.assetName}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/fixed-assets-management/asset-disposals/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Disposal Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.disposalRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Disposal Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.disposalType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.assetRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.assetName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Disposal Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.disposalDate
                ? new Date(record.disposalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Book Value at Disposal
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.bookValueAtDisposal ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sale Proceeds
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.saleProceeds ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gain/Loss</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.gainLoss ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Buyer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.buyerName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Buyer Contact
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.buyerContact || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.approvedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approval Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.certificateRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Environmental Compliance
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.environmentalCompliance ? "success" : "secondary"
                }
              >
                {record.environmentalCompliance ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Journal Entry Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.journalEntryRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "approved"
                      ? "default"
                      : record.status === "pending_approval"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Disposal Reason
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.disposalReason || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
