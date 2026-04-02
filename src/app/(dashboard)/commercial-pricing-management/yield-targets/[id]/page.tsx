import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmYieldTargets } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function YieldTargetDetailPage({
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
    .from(cpmYieldTargets)
    .where(
      and(
        eq(cpmYieldTargets.id, id),
        eq(cpmYieldTargets.tenantId, session.tenantId),
        isNull(cpmYieldTargets.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "achieved":
        return "secondary";
      case "missed":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "outline";
    }
  };

  const details = [
    { label: "Target Name", value: record.targetName },
    { label: "Trade Lane", value: record.tradeLane },
    { label: "Service Type", value: record.serviceType },
    { label: "Fiscal Year", value: record.fiscalYear },
    { label: "Fiscal Quarter", value: record.fiscalQuarter },
    { label: "Target Revenue/TEU", value: record.targetRevenuePerTeu },
    { label: "Actual Revenue/TEU", value: record.actualRevenuePerTeu },
    { label: "Target Utilization %", value: record.targetUtilizationPercent != null ? `${record.targetUtilizationPercent}%` : null },
    { label: "Actual Utilization %", value: record.actualUtilizationPercent != null ? `${record.actualUtilizationPercent}%` : null },
    { label: "Target TEU", value: record.targetTeu },
    { label: "Actual TEU", value: record.actualTeu },
    { label: "Minimum Rate Threshold", value: record.minimumRateThreshold },
    { label: "Currency", value: record.currency },
    { label: "Notes", value: record.notes },
    { label: "Created At", value: record.createdAt.toLocaleString() },
    { label: "Updated At", value: record.updatedAt.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/yield-targets"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{record.targetName}</h1>
          <Badge variant={statusColor(record.status)}>{record.status}</Badge>
        </div>
        <Link
          href={`/commercial-pricing-management/yield-targets/${record.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-sm">{detail.value ?? <span className="text-muted-foreground italic">--</span>}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
