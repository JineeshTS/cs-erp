import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getInventorySnapshot } from "@/lib/empty-container-repositioning-ai/service";

export default async function InventorySnapshotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const snapshot = await getInventorySnapshot(id, session.tenantId);
  if (!snapshot) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/empty-container-repositioning-ai/inventory-snapshots"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {snapshot.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {snapshot.snapshotRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/inventory-snapshots/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  snapshot.status === "active"
                    ? "default"
                    : snapshot.status === "draft"
                      ? "secondary"
                      : "outline"
                }
              >
                {snapshot.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Snapshot Type</dt>
            <dd className="mt-1 text-sm">{snapshot.snapshotType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Location Code</dt>
            <dd className="mt-1 text-sm">{snapshot.locationCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Location Name</dt>
            <dd className="mt-1 text-sm">{snapshot.locationName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Container Type</dt>
            <dd className="mt-1 text-sm">{snapshot.containerType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Available Count</dt>
            <dd className="mt-1 text-sm">{snapshot.availableCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Damaged Count</dt>
            <dd className="mt-1 text-sm">{snapshot.damagedCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Total Count</dt>
            <dd className="mt-1 text-sm">{snapshot.totalCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Avg Dwell Days</dt>
            <dd className="mt-1 text-sm">{snapshot.avgDwellDays}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Surplus / Deficit</dt>
            <dd className="mt-1 text-sm">{snapshot.surplusDeficit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Snapshot Date</dt>
            <dd className="mt-1 text-sm">
              {snapshot.snapshotDate
                ? new Date(snapshot.snapshotDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">
              {snapshot.notes || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
