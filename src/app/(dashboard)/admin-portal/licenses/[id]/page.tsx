import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminLicenses } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "success" | "destructive" | "warning" | "secondary"
> = {
  active: "success",
  expired: "destructive",
  suspended: "warning",
  cancelled: "secondary",
};

function formatAmount(amount: number, currency: string): string {
  const major = amount / 100;
  return `${currency} ${major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  const [license] = await db
    .select()
    .from(adminLicenses)
    .where(
      and(
        eq(adminLicenses.id, id),
        eq(adminLicenses.tenantId, session.tenantId),
        isNull(adminLicenses.deletedAt)
      )
    )
    .limit(1);

  if (!license) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-portal/licenses"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {license.licenseName}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/admin-portal/licenses/${license.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">License Key</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.licenseKey}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">License Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.licenseName}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">License Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.licenseType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.plan}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[license.status] ?? "secondary"}
              >
                {license.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Users</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.maxUsers}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Max Storage (MB)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.maxStorage}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Billing Cycle
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.billingCycle}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Amount Per Cycle
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatAmount(license.amountPerCycle, license.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.currency}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Features</dt>
            <dd className="mt-1">
              {license.features ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(license.features, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Starts At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.startsAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expires At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.expiresAt
                ? license.expiresAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Renewed At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.renewedAt
                ? license.renewedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cancelled At
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.cancelledAt
                ? license.cancelledAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.metadata
                ? JSON.stringify(license.metadata, null, 2)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
