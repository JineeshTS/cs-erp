import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmDetentionDemurrage } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function DetentionDemurrageDetailPage({
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
    .from(cpmDetentionDemurrage)
    .where(
      and(
        eq(cpmDetentionDemurrage.id, id),
        eq(cpmDetentionDemurrage.tenantId, session.tenantId),
        isNull(cpmDetentionDemurrage.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const details = [
    { label: "Tariff Code", value: record.tariffCode },
    { label: "Tariff Name", value: record.tariffName },
    { label: "Charge Type", value: record.chargeType },
    { label: "Port Code", value: record.portCode },
    { label: "Container Type", value: record.containerType },
    { label: "Container Size", value: record.containerSize },
    { label: "Free Time (Days)", value: record.freeTimeDays },
    { label: "Daily Rate", value: record.dailyRate },
    { label: "Escalation Rate", value: record.escalationRate },
    { label: "Escalation After (Days)", value: record.escalationAfterDays },
    { label: "Maximum Days", value: record.maximumDays },
    { label: "Currency", value: record.currency },
    { label: "Customer Segment", value: record.customerSegment },
    { label: "Effective From", value: record.effectiveFrom ? new Date(record.effectiveFrom).toLocaleString() : null },
    { label: "Effective To", value: record.effectiveTo ? new Date(record.effectiveTo).toLocaleString() : null },
    { label: "Notes", value: record.notes },
    { label: "Created At", value: record.createdAt.toLocaleString() },
    { label: "Updated At", value: record.updatedAt.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/detention-demurrage"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{record.tariffName}</h1>
          <Badge variant={statusColor(record.status)}>{record.status}</Badge>
        </div>
        <Link
          href={`/commercial-pricing-management/detention-demurrage/${record.id}/edit`}
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
