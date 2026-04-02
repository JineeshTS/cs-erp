import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorMaster } from "@/lib/accounts-payable-vendor-management/service";
import { Badge } from "@/components/ui/badge";

export default async function VendorMasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:read")))
    redirect("/accounts-payable-vendor-management");

  const { id } = await params;
  const record = await getVendorMaster(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "payable:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/vendor-masters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.vendorName}
          </h1>
          <p className="text-sm text-gray-500">{record.vendorCode}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/accounts-payable-vendor-management/vendor-masters/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Vendor Code</dt>
            <dd className="mt-1 text-gray-900">{record.vendorCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trading Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.tradingName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Type</dt>
            <dd className="mt-1 text-gray-900">{record.vendorType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Registration Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.registrationNumber ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
            <dd className="mt-1 text-gray-900">{record.taxId ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Industry</dt>
            <dd className="mt-1 text-gray-900">{record.industry ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">{record.country ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Payment Terms
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.paymentTerms ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-gray-900">{record.bankName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bank Account Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bankAccountNumber ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bank SWIFT Code
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bankSwiftCode ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank IBAN</dt>
            <dd className="mt-1 text-gray-900">{record.bankIban ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.contactName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Email
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactEmail ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Contact Phone
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactPhone ?? "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-gray-900">{record.address ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Onboarding Status
            </dt>
            <dd className="mt-1 text-gray-900">{record.onboardingStatus}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Risk Rating</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.riskRating === "critical" ||
                  record.riskRating === "high"
                    ? "destructive"
                    : record.riskRating === "medium"
                      ? "warning"
                      : "secondary"
                }
              >
                {record.riskRating ?? "--"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Performance Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.performanceScore ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Spend</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalSpend.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalOrders.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "blacklisted"
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
            <dd className="mt-1 text-gray-900">{record.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
