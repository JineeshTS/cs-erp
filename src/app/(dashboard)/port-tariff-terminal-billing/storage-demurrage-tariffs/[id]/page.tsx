import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getStorageDemurrageTariff } from "@/lib/port-tariff-terminal-billing/service";
import { Badge } from "@/components/ui/badge";

export default async function StorageDemurrageTariffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:read")))
    redirect("/");

  const { id } = await params;
  const record = await getStorageDemurrageTariff(id, session.tenantId);
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
            href="/port-tariff-terminal-billing/storage-demurrage-tariffs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.tariffRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Storage &amp; Demurrage Tariff Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/port-tariff-terminal-billing/storage-demurrage-tariffs/${id}/edit`}
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
              Tariff Ref
            </dt>
            <dd className="mt-1 text-sm">{record.tariffRef}</dd>
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
              Tariff Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.tariffType?.replace(/_/g, " ") ?? "\u2014"}
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
              Terminal Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.terminalName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Container Size
            </dt>
            <dd className="mt-1 text-sm">
              {record.containerSize ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Container Type
            </dt>
            <dd className="mt-1 text-sm">
              {record.containerType ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Free Days
            </dt>
            <dd className="mt-1 text-sm">
              {record.freeDays != null ? String(record.freeDays) : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Daily Rate Tier 1
            </dt>
            <dd className="mt-1 text-sm">
              {record.dailyRateTier1 ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tier 1 Days (From - To)
            </dt>
            <dd className="mt-1 text-sm">
              {record.tier1DaysFrom != null && record.tier1DaysTo != null
                ? `${record.tier1DaysFrom} - ${record.tier1DaysTo}`
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Daily Rate Tier 2
            </dt>
            <dd className="mt-1 text-sm">
              {record.dailyRateTier2 ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tier 2 Days (From - To)
            </dt>
            <dd className="mt-1 text-sm">
              {record.tier2DaysFrom != null && record.tier2DaysTo != null
                ? `${record.tier2DaysFrom} - ${record.tier2DaysTo}`
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Daily Rate Tier 3
            </dt>
            <dd className="mt-1 text-sm">
              {record.dailyRateTier3 ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tariff Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.tariffCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Effective From
            </dt>
            <dd className="mt-1 text-sm">
              {record.effectiveFrom
                ? new Date(record.effectiveFrom).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Effective To
            </dt>
            <dd className="mt-1 text-sm">
              {record.effectiveTo
                ? new Date(record.effectiveTo).toLocaleString()
                : "\u2014"}
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
