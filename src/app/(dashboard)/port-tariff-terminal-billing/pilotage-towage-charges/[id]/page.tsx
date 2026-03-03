import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPilotageTowageCharge } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function PilotageTowageChargeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getPilotageTowageCharge(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ptt:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/port-tariff-terminal-billing/pilotage-towage-charges"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.chargeRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Pilotage &amp; Towage Charge Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/pilotage-towage-charges/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Charge Ref
            </dt>
            <dd className="mt-1 text-sm">{record.chargeRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Charge Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.chargeType?.replace(/_/g, " ") ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Port Code
            </dt>
            <dd className="mt-1 text-sm">{record.portCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Port Name
            </dt>
            <dd className="mt-1 text-sm">{record.portName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel Name
            </dt>
            <dd className="mt-1 text-sm">{record.vesselName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel GRT
            </dt>
            <dd className="mt-1 text-sm">{record.vesselGrt ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel LOA
            </dt>
            <dd className="mt-1 text-sm">{record.vesselLoa ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Number of Tugs
            </dt>
            <dd className="mt-1 text-sm">
              {record.numberOfTugs != null
                ? String(record.numberOfTugs)
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tug Hours
            </dt>
            <dd className="mt-1 text-sm">{record.tugHours ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Pilotage Distance
            </dt>
            <dd className="mt-1 text-sm">
              {record.pilotageDistance ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rate Per GRT
            </dt>
            <dd className="mt-1 text-sm">{record.ratePerGrt ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Base Charge
            </dt>
            <dd className="mt-1 text-sm">{record.baseCharge ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Calculated Amount
            </dt>
            <dd className="mt-1 text-sm">
              {record.calculatedAmount ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Charge Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.chargeCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Night Surcharge
            </dt>
            <dd className="mt-1 text-sm">
              {record.nightSurcharge ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Weekend Surcharge
            </dt>
            <dd className="mt-1 text-sm">
              {record.weekendSurcharge ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
