import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getRepositioningPlan } from "@/lib/empty-container-repositioning-ai/service";

export default async function RepositioningPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const plan = await getRepositioningPlan(id, session.tenantId);
  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/empty-container-repositioning-ai/repositioning-plans"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {plan.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {plan.planRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/repositioning-plans/${id}/edit`}
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
                  plan.status === "active"
                    ? "default"
                    : plan.status === "draft"
                      ? "secondary"
                      : "outline"
                }
              >
                {plan.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Plan Type</dt>
            <dd className="mt-1 text-sm">{plan.planType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Origin Port</dt>
            <dd className="mt-1 text-sm">{plan.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Destination Port</dt>
            <dd className="mt-1 text-sm">{plan.destinationPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Container Type</dt>
            <dd className="mt-1 text-sm">{plan.containerType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Quantity</dt>
            <dd className="mt-1 text-sm">{plan.quantity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">ETD</dt>
            <dd className="mt-1 text-sm">
              {plan.etd ? new Date(plan.etd).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">ETA</dt>
            <dd className="mt-1 text-sm">
              {plan.eta ? new Date(plan.eta).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
            <dd className="mt-1 text-sm">{plan.vesselName || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Voyage Ref</dt>
            <dd className="mt-1 text-sm">{plan.voyageRef || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Estimated Cost</dt>
            <dd className="mt-1 text-sm">{plan.estimatedCost || "—"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">
              {plan.notes || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
