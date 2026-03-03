import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAltFuelTracking } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
    case "completed":
    case "verified":
      return <Badge variant="success">{status}</Badge>;
    case "cancelled":
    case "rejected":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function AltFuelTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;
  const record = await getAltFuelTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sustainability-esg-reporting/alt-fuel-trackings"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Alt Fuel Trackings
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.trackingRef}
          </h1>
        </div>
        <Link
          href={`/sustainability-esg-reporting/alt-fuel-trackings/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tracking Ref
            </dt>
            <dd className="mt-1 text-sm">{record.trackingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tracking Type
            </dt>
            <dd className="mt-1 text-sm">{record.trackingType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fuel Name
            </dt>
            <dd className="mt-1 text-sm">{record.fuelName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fuel Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.fuelCategory ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.vesselName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Quantity (MT)
            </dt>
            <dd className="mt-1 text-sm">
              {record.quantityMt ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Cost Per MT
            </dt>
            <dd className="mt-1 text-sm">
              {record.costPerMt ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Cost
            </dt>
            <dd className="mt-1 text-sm">
              {record.totalCost ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fuel Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.fuelCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              CO2 Reduction %
            </dt>
            <dd className="mt-1 text-sm">
              {record.co2ReductionPct ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Supplier Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.supplierName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Certification Ref
            </dt>
            <dd className="mt-1 text-sm">
              {record.certificationRef ?? "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
