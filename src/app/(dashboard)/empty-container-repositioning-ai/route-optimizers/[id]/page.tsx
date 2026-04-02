import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimizer } from "@/lib/empty-container-repositioning-ai/service";

export default async function RouteOptimizerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const routeOptimizer = await getRouteOptimizer(id, session.tenantId);
  if (!routeOptimizer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/empty-container-repositioning-ai/route-optimizers"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {routeOptimizer.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {routeOptimizer.optimizerRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/route-optimizers/${id}/edit`}
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
              <dt className="text-sm text-muted-foreground">Optimizer Ref</dt>
              <dd className="font-mono text-sm">
                {routeOptimizer.optimizerRef}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Title</dt>
              <dd>{routeOptimizer.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Optimizer Type</dt>
              <dd>
                <Badge variant="outline">
                  {routeOptimizer.optimizerType.replace(/_/g, " ")}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Scenario Name</dt>
              <dd>{routeOptimizer.scenarioName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd>
                <Badge
                  variant={
                    routeOptimizer.status === "active" ? "default" : "secondary"
                  }
                >
                  {routeOptimizer.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Optimization Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                Objective Function
              </dt>
              <dd>{routeOptimizer.objectiveFunction ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total Savings</dt>
              <dd className="font-mono text-lg font-semibold">
                {routeOptimizer.totalSavings}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Route Count</dt>
              <dd>{routeOptimizer.routeCount}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Run Date</dt>
              <dd>{routeOptimizer.runDate ? routeOptimizer.runDate.toLocaleDateString() : "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Ports & Container Types</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Origin Ports</dt>
              <dd className="text-sm whitespace-pre-wrap">
                {routeOptimizer.originPorts || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Destination Ports
              </dt>
              <dd className="text-sm whitespace-pre-wrap">
                {routeOptimizer.destinationPorts || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Container Types</dt>
              <dd className="text-sm whitespace-pre-wrap">
                {routeOptimizer.containerTypes || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">AI Recommendation</h2>
          <p className="text-sm whitespace-pre-wrap">
            {routeOptimizer.aiRecommendation || "No AI recommendation yet."}
          </p>
        </div>

        <div className="rounded-lg border p-6 space-y-4 md:col-span-2">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">
            {routeOptimizer.notes || "No notes recorded."}
          </p>
        </div>
      </div>
    </div>
  );
}
