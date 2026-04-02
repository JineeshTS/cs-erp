import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBunkerOrder } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BunkerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/");

  const { id } = await params;
  const order = await getBunkerOrder(id, session.tenantId);
  if (!order) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Order Ref", value: order.orderRef },
    { label: "Vessel Name", value: order.vesselName },
    { label: "Vessel IMO", value: order.vesselImo },
    { label: "Voyage Ref", value: order.voyageRef },
    { label: "Supplier Name", value: order.supplierName },
    { label: "Supplier Code", value: order.supplierCode },
    { label: "Port", value: order.port },
    {
      label: "Delivery Date",
      value: order.deliveryDate
        ? new Date(order.deliveryDate).toLocaleString()
        : null,
    },
    { label: "Fuel Type", value: order.fuelType },
    { label: "Fuel Grade", value: order.fuelGrade },
    { label: "Qty Ordered", value: order.quantityOrdered },
    { label: "Qty Delivered", value: order.quantityDelivered },
    { label: "Unit", value: order.unit },
    { label: "Price Per Unit", value: order.pricePerUnit },
    { label: "Currency", value: order.currency },
    { label: "Total Amount", value: order.totalAmount },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            order.status === "confirmed" || order.status === "delivered"
              ? "success"
              : order.status === "cancelled"
                ? "destructive"
                : "secondary"
          }
        >
          {order.status}
        </Badge>
      ),
    },
    { label: "Payment Terms", value: order.paymentTerms },
    {
      label: "Confirmed At",
      value: order.confirmedAt
        ? new Date(order.confirmedAt).toLocaleString()
        : null,
    },
    {
      label: "Delivered At",
      value: order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: order.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/bunker-fuel-management/orders"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderRef}
            </h1>
            <p className="text-sm text-gray-500">Bunker Order Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/bunker-fuel-management/orders/${order.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
