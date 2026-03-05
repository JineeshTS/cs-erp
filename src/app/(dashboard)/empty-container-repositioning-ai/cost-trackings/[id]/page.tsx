import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCostTracking } from "@/lib/empty-container-repositioning-ai/service";

export default async function CostTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const costTracking = await getCostTracking(id, session.tenantId);
  if (!costTracking) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/empty-container-repositioning-ai/cost-trackings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {costTracking.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {costTracking.costRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/cost-trackings/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">General Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Cost Ref</dt>
              <dd className="font-mono text-sm">{costTracking.costRef}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Title</dt>
              <dd>{costTracking.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Cost Type</dt>
              <dd>
                <Badge variant="outline">
                  {costTracking.costType.replace(/_/g, " ")}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Plan Ref</dt>
              <dd>{costTracking.planRef ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Container Type</dt>
              <dd>{costTracking.containerType ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd>
                <Badge
                  variant={
                    costTracking.status === "active" ? "default" : "secondary"
                  }
                >
                  {costTracking.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Cost Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Quantity</dt>
              <dd>{costTracking.quantity}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Unit Cost</dt>
              <dd className="font-mono">{costTracking.unitCost}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total Cost</dt>
              <dd className="font-mono text-lg font-semibold">
                {costTracking.totalCost}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Currency</dt>
              <dd>{costTracking.currency}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Approval</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Approved</dt>
              <dd>
                <Badge variant={costTracking.isApproved ? "default" : "secondary"}>
                  {costTracking.isApproved ? "Yes" : "No"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Approved By</dt>
              <dd>{costTracking.approvedBy ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Approved Date</dt>
              <dd>{costTracking.approvedDate ? costTracking.approvedDate.toLocaleDateString() : "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">
            {costTracking.notes || "No notes recorded."}
          </p>
        </div>
      </div>
    </div>
  );
}
