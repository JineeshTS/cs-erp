import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLetterOfCredit } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function LetterOfCreditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "treasury:edit"
  );

  const record = await getLetterOfCredit(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/treasury-cash-management/letters-of-credit"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{record.lcRef}</h1>
        </div>
        {canEdit && (
          <Link
            href={`/treasury-cash-management/letters-of-credit/${record.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">LC Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.lcRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">LC Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.lcType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issuing Bank</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.issuingBank || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Advising Bank
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.advisingBank || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confirming Bank
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.confirmingBank || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicant</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.applicant || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Beneficiary</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.beneficiary || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">LC Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.lcAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.issueDate
                ? new Date(record.issueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Shipment Deadline
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.shipmentDeadline
                ? new Date(record.shipmentDeadline).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Presentation Period
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.presentationPeriod ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Partial Shipment
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.partialShipment ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transshipment
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.transshipment ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">
              Terms and Conditions
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.termsAndConditions || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilization Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.utilizationAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Available Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.availableAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charges</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.charges ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "issued"
                    ? "success"
                    : record.status === "expired"
                      ? "destructive"
                      : record.status === "draft"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
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
