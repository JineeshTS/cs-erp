import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmPricingApprovals } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  escalated: "bg-purple-100 text-purple-800",
};

export default async function PricingApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmPricingApprovals)
    .where(
      and(
        eq(cpmPricingApprovals.id, id),
        eq(cpmPricingApprovals.tenantId, session.tenantId),
        isNull(cpmPricingApprovals.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/pricing-approvals"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{record.approvalReference}</h1>
          {record.status && (
            <Badge className={STATUS_COLORS[record.status] ?? ""}>
              {record.status.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <Link
          href={`/commercial-pricing-management/pricing-approvals/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Approval Reference</p>
            <p className="mt-1 font-medium">{record.approvalReference}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approval Type</p>
            <p className="mt-1 font-medium">
              {record.approvalType ? record.approvalType.replace(/_/g, " ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entity Type</p>
            <p className="mt-1 font-medium">
              {record.entityType ? record.entityType.replace(/_/g, " ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entity ID</p>
            <p className="mt-1 font-medium">{record.entityId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requested By</p>
            <p className="mt-1 font-medium">{record.requestedBy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Level</p>
            <p className="mt-1 font-medium">{record.currentLevel ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max Level</p>
            <p className="mt-1 font-medium">{record.maxLevel ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deviation Percent</p>
            <p className="mt-1 font-medium">
              {record.deviationPercent != null ? `${record.deviationPercent}%` : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Original Amount</p>
            <p className="mt-1 font-medium">{record.originalAmount ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requested Amount</p>
            <p className="mt-1 font-medium">{record.requestedAmount ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="mt-1 font-medium">{record.currency ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Urgency</p>
            <p className="mt-1 font-medium">
              {record.urgency ? record.urgency.replace(/_/g, " ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-1 font-medium">
              {record.status ? record.status.replace(/_/g, " ") : "-"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="mt-1 font-medium whitespace-pre-wrap">{record.notes ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="mt-1 font-medium">
              {record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Updated At</p>
            <p className="mt-1 font-medium">
              {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
