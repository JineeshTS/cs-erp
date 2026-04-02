import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAllianceAgreement } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  suspended: "warning",
  expired: "destructive",
} as const;

export default async function AllianceAgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const agreement = await getAllianceAgreement(id, session.tenantId);
  if (!agreement) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/alliance-agreements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {agreement.allianceName}
          </h1>
          <p className="text-sm text-gray-500">{agreement.allianceRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/alliance-agreements/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Alliance Ref</dt>
            <dd className="mt-1 text-gray-900">{agreement.allianceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Alliance Name
            </dt>
            <dd className="mt-1 text-gray-900">{agreement.allianceName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Alliance Type
            </dt>
            <dd className="mt-1 text-gray-900">{agreement.allianceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Count</dt>
            <dd className="mt-1 text-gray-900">{agreement.memberCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Deployed TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.totalDeployedTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Sharing Arrangement
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.vesselSharingArrangement ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Joint Service Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.jointServiceCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Governance Structure
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.governanceStructure ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Meeting Schedule
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.meetingSchedule ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-gray-900">
              {agreement.effectiveFrom
                ? new Date(agreement.effectiveFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {agreement.effectiveTo
                ? new Date(agreement.effectiveTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Regulatory Approval
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  agreement.regulatoryApproval ? "success" : "secondary"
                }
              >
                {agreement.regulatoryApproval ? "Approved" : "Pending"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    agreement.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {agreement.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {agreement.notes ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
