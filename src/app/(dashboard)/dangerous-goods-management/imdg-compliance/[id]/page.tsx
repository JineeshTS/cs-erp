import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getImdgCompliance } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ImdgComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const record = await getImdgCompliance(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/imdg-compliance"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.complianceRef}</h1>
          <p className="text-sm text-gray-500">
            UN {record.unNumber} &middot; {record.properShippingName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/imdg-compliance/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Compliance Ref</dt>
            <dd className="mt-1 text-gray-900">{record.complianceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">{record.unNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Proper Shipping Name</dt>
            <dd className="mt-1 text-gray-900">{record.properShippingName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Technical Name</dt>
            <dd className="mt-1 text-gray-900">{record.technicalName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Class</dt>
            <dd className="mt-1 text-gray-900">{record.imdgClass}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Subsidiary Risk</dt>
            <dd className="mt-1 text-gray-900">{record.imdgSubsidiaryRisk || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Packing Group</dt>
            <dd className="mt-1 text-gray-900">{record.packingGroup || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Marine Pollutant</dt>
            <dd className="mt-1">
              <Badge variant={record.marinePollutant ? "destructive" : "secondary"}>
                {record.marinePollutant ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">EMS Number</dt>
            <dd className="mt-1 text-gray-900">{record.emsNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flash Point</dt>
            <dd className="mt-1 text-gray-900">{record.flashPoint || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Limited Quantity</dt>
            <dd className="mt-1">
              <Badge variant={record.limitedQuantity ? "success" : "secondary"}>
                {record.limitedQuantity ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Excepted Quantity</dt>
            <dd className="mt-1">
              <Badge variant={record.exceptedQuantity ? "success" : "secondary"}>
                {record.exceptedQuantity ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stowage Category</dt>
            <dd className="mt-1 text-gray-900">{record.stowageCategory || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Segregation Group</dt>
            <dd className="mt-1 text-gray-900">{record.segregationGroup || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Code Edition</dt>
            <dd className="mt-1 text-gray-900">{record.imdgCodeEdition || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amendment Number</dt>
            <dd className="mt-1 text-gray-900">{record.amendmentNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective From</dt>
            <dd className="mt-1 text-gray-900">
              {record.effectiveFrom
                ? new Date(record.effectiveFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {record.effectiveTo
                ? new Date(record.effectiveTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "expired"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
