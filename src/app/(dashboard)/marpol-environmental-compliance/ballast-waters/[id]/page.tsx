import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { getBallastWater } from "@/lib/marpol-environmental-compliance/service";

export default async function BallastWaterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:read")))
    redirect("/");

  const { id } = await params;
  const record = await getBallastWater(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{record.title || "\u2014"}</h1>
          <p className="text-sm text-muted-foreground">
            {record.ballastRef || "\u2014"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/marpol-environmental-compliance/ballast-waters"
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Back to List
          </Link>
          <Link
            href={`/marpol-environmental-compliance/ballast-waters/${id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Ballast Type</dt>
            <dd className="mt-1 text-sm">{record.ballastType || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
            <dd className="mt-1 text-sm">{record.vesselName || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">IMO Number</dt>
            <dd className="mt-1 text-sm">{record.imoNumber || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Treatment System</dt>
            <dd className="mt-1 text-sm">{record.treatmentSystem || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Operation Date</dt>
            <dd className="mt-1 text-sm">
              {record.operationDate ? record.operationDate.toLocaleDateString() : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Port Name</dt>
            <dd className="mt-1 text-sm">{record.portName || "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Volume (m\u00B3)</dt>
            <dd className="mt-1 text-sm">{record.volumeCubicMeters ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Exchange Latitude</dt>
            <dd className="mt-1 text-sm">{record.exchangeLatitude ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Exchange Longitude</dt>
            <dd className="mt-1 text-sm">{record.exchangeLongitude ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Compliant</dt>
            <dd className="mt-1 text-sm">{record.isCompliant ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status || "\u2014"}</Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">{record.notes || "\u2014"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
