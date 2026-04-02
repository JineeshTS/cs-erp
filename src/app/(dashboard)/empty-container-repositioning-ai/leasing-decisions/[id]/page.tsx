import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getLeasingDecision } from "@/lib/empty-container-repositioning-ai/service";

export default async function LeasingDecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const decision = await getLeasingDecision(id, session.tenantId);
  if (!decision) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/empty-container-repositioning-ai/leasing-decisions"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {decision.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {decision.decisionRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/leasing-decisions/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border">
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge
                variant={
                  decision.status === "active" ? "default" : "secondary"
                }
              >
                {decision.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Decision Type
            </p>
            <p className="mt-1 text-sm">
              <Badge variant="outline">{decision.decisionType}</Badge>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Location Code
            </p>
            <p className="mt-1 text-sm">{decision.locationCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Container Type
            </p>
            <p className="mt-1 text-sm">{decision.containerType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Quantity
            </p>
            <p className="mt-1 text-sm">{decision.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Reposition Cost
            </p>
            <p className="mt-1 text-sm">{decision.repositionCost ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Leasing Cost
            </p>
            <p className="mt-1 text-sm">{decision.leasingCost ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Break-Even Days
            </p>
            <p className="mt-1 text-sm">{decision.breakEvenDays ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Recommended Action
            </p>
            <p className="mt-1 text-sm">{decision.recommendedAction}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Savings Amount
            </p>
            <p className="mt-1 text-sm">{decision.savingsAmount ?? "—"}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm font-medium text-muted-foreground">
              AI Recommendation
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {decision.aiRecommendation ?? "—"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {decision.notes ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
