import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDunningAction } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "promised":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export default async function DunningActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const record = await getDunningAction(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/dunning-actions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.actionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.customerName} &middot; {record.actionType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/dunning-actions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Action Ref</dt>
            <dd className="mt-1 text-gray-900">{record.actionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.invoiceNumber ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{record.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Action Type</dt>
            <dd className="mt-1 text-gray-900">{record.actionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dunning Level</dt>
            <dd className="mt-1 text-gray-900">{record.dunningLevel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Outstanding Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.outstandingAmount?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Days Past Due</dt>
            <dd className="mt-1 text-gray-900">{record.daysPastDue}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Method</dt>
            <dd className="mt-1 text-gray-900">
              {record.contactMethod ?? "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Contact Details
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.contactDetails ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Message Template
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.messageTemplate ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sent At</dt>
            <dd className="mt-1 text-gray-900">
              {record.sentAt
                ? new Date(record.sentAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Responded At</dt>
            <dd className="mt-1 text-gray-900">
              {record.respondedAt
                ? new Date(record.respondedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Promised Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.promisedDate
                ? new Date(record.promisedDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Promised Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.promisedAmount != null
                ? record.promisedAmount.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
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
