import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBunkerStem } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BunkerStemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/");

  const { id } = await params;
  const stem = await getBunkerStem(id, session.tenantId);
  if (!stem) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Stem Ref", value: stem.stemRef },
    { label: "Order ID", value: stem.orderId },
    { label: "Vessel Name", value: stem.vesselName },
    { label: "Vessel IMO", value: stem.vesselImo },
    { label: "Port", value: stem.port },
    { label: "Berth", value: stem.berth },
    { label: "Supplier Name", value: stem.supplierName },
    { label: "Barge Name", value: stem.bargeName },
    { label: "Fuel Type", value: stem.fuelType },
    { label: "Fuel Grade", value: stem.fuelGrade },
    { label: "Qty Nominated", value: stem.quantityNominated },
    { label: "Qty Delivered", value: stem.quantityDelivered },
    { label: "Unit", value: stem.unit },
    {
      label: "Delivery Window Start",
      value: stem.deliveryWindowStart
        ? new Date(stem.deliveryWindowStart).toLocaleString()
        : null,
    },
    {
      label: "Delivery Window End",
      value: stem.deliveryWindowEnd
        ? new Date(stem.deliveryWindowEnd).toLocaleString()
        : null,
    },
    {
      label: "Actual Delivery Start",
      value: stem.actualDeliveryStart
        ? new Date(stem.actualDeliveryStart).toLocaleString()
        : null,
    },
    {
      label: "Actual Delivery End",
      value: stem.actualDeliveryEnd
        ? new Date(stem.actualDeliveryEnd).toLocaleString()
        : null,
    },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            stem.status === "confirmed" || stem.status === "completed"
              ? "success"
              : stem.status === "cancelled"
                ? "destructive"
                : "secondary"
          }
        >
          {stem.status}
        </Badge>
      ),
    },
    { label: "Pumping Rate", value: stem.pumpingRate },
    { label: "Notes", value: stem.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/bunker-fuel-management/stems"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stem.stemRef}
            </h1>
            <p className="text-sm text-gray-500">Bunker Stem Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/bunker-fuel-management/stems/${stem.id}/edit`}
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
