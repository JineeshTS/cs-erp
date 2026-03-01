import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getQualityClaim } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function QualityClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/bunker-fuel-management");

  const { id } = await params;

  const claim = await getQualityClaim(id, session.tenantId);
  if (!claim) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/quality-claims"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {claim.claimRef}
          </h1>
          <p className="text-sm text-gray-500">
            {claim.supplierName} &middot; {claim.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/bunker-fuel-management/quality-claims/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Claim Ref</dt>
            <dd className="mt-1 text-gray-900">{claim.claimRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Test ID</dt>
            <dd className="mt-1 text-gray-900">{claim.testId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Order ID</dt>
            <dd className="mt-1 text-gray-900">{claim.orderId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Supplier Name
            </dt>
            <dd className="mt-1 text-gray-900">{claim.supplierName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{claim.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Claim Type</dt>
            <dd className="mt-1 text-gray-900">{claim.claimType}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Claim Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {claim.claimDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Claim Amount</dt>
            <dd className="mt-1 text-gray-900">{claim.claimAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{claim.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Qty Disputed
            </dt>
            <dd className="mt-1 text-gray-900">
              {claim.quantityDisputed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  claim.status === "resolved" || claim.status === "settled"
                    ? "success"
                    : claim.status === "rejected"
                      ? "destructive"
                      : claim.status === "investigating"
                        ? "warning"
                        : "secondary"
                }
              >
                {claim.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Filed At</dt>
            <dd className="mt-1 text-gray-900">
              {claim.filedAt
                ? new Date(claim.filedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
            <dd className="mt-1 text-gray-900">
              {claim.resolvedAt
                ? new Date(claim.resolvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Resolution Notes
            </dt>
            <dd className="mt-1 text-gray-900">
              {claim.resolutionNotes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Settlement Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {claim.settlementAmount ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{claim.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
