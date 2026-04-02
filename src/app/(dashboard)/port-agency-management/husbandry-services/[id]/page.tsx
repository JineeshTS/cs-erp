import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHusbandryService } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  requested: "secondary",
  approved: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default async function HusbandryServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const svc = await getHusbandryService(id, session.tenantId);
  if (!svc) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/husbandry-services"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{svc.serviceRef}</h1>
          <p className="text-sm text-gray-500">
            {svc.serviceType} &middot; {svc.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/husbandry-services/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Service Ref</dt>
            <dd className="mt-1 text-gray-900">{svc.serviceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Type</dt>
            <dd className="mt-1 text-gray-900">{svc.serviceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    svc.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {svc.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{svc.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{svc.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">{svc.portCallRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{svc.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Supplier Name
            </dt>
            <dd className="mt-1 text-gray-900">{svc.supplierName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Supplier Contact
            </dt>
            <dd className="mt-1 text-gray-900">
              {svc.supplierContact || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Supplier Phone
            </dt>
            <dd className="mt-1 text-gray-900">{svc.supplierPhone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requested Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(svc.requestedDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Delivery Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(svc.deliveryDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Quantity</dt>
            <dd className="mt-1 text-gray-900">
              {svc.quantity != null ? `${svc.quantity} ${svc.unit || ""}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-gray-900">{svc.unit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {svc.estimatedCost != null
                ? `${svc.estimatedCost} ${svc.currency || ""}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Cost</dt>
            <dd className="mt-1 text-gray-900">
              {svc.actualCost != null
                ? `${svc.actualCost} ${svc.currency || ""}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{svc.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Ref</dt>
            <dd className="mt-1 text-gray-900">{svc.invoiceRef || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {svc.description || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {svc.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {svc.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {svc.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
