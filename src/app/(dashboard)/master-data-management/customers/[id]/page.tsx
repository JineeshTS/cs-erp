import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { customers } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bookings:read")))
    redirect("/master-data-management");

  const { id } = await params;

  const customer = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.id, id),
        eq(customers.tenantId, session.tenantId),
        isNull(customers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!customer) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bookings:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/customers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500">
            {customer.customerType}
            {customer.country ? ` \u00b7 ${customer.country}` : ""}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/master-data-management/customers/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Customer Type
            </dt>
            <dd className="mt-1 text-gray-900">{customer.customerType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Short Name</dt>
            <dd className="mt-1 text-gray-900">
              {customer.shortName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  customer.status === "active" ? "success" : "secondary"
                }
              >
                {customer.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
            <dd className="mt-1 text-gray-900">{customer.taxId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Registration Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {customer.registrationNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">{customer.country || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-gray-900">{customer.city || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
            <dd className="mt-1 text-gray-900">
              {customer.postalCode || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 whitespace-pre-line text-gray-900">
              {customer.address || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-gray-900">{customer.phone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-gray-900">{customer.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="mt-1 text-gray-900">{customer.website || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
            <dd className="mt-1 text-gray-900">
              {customer.creditLimitAmount != null
                ? `${customer.creditLimitAmount.toLocaleString()} ${customer.creditLimitCurrency}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Terms
            </dt>
            <dd className="mt-1 text-gray-900">
              {customer.paymentTermsDays} days
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
