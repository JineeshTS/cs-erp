import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDecarbRoadmap } from "@/lib/sustainability-esg-reporting/service";
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

export default async function DecarbRoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;
  const record = await getDecarbRoadmap(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sustainability-esg-reporting/decarb-roadmaps"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Decarb Roadmaps
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.roadmapRef}
          </h1>
        </div>
        <Link
          href={`/sustainability-esg-reporting/decarb-roadmaps/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Roadmap Ref
            </dt>
            <dd className="mt-1 text-sm">{record.roadmapRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Roadmap Type
            </dt>
            <dd className="mt-1 text-sm">{record.roadmapType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Milestone Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.milestoneName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Target Year
            </dt>
            <dd className="mt-1 text-sm">
              {record.targetYear ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Target Reduction %
            </dt>
            <dd className="mt-1 text-sm">
              {record.targetReductionPct ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Current Reduction %
            </dt>
            <dd className="mt-1 text-sm">
              {record.currentReductionPct ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Investment Required
            </dt>
            <dd className="mt-1 text-sm">
              {record.investmentRequired ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Investment Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.investmentCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Technology Area
            </dt>
            <dd className="mt-1 text-sm">
              {record.technologyArea ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Implementation Status
            </dt>
            <dd className="mt-1 text-sm">
              {record.implementationStatus ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Risk Level
            </dt>
            <dd className="mt-1 text-sm">
              {record.riskLevel ?? "\u2014"}
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
