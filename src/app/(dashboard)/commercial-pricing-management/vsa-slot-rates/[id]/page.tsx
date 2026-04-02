import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmVsaSlotRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VsaSlotRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmVsaSlotRates)
    .where(
      and(
        eq(cpmVsaSlotRates.id, id),
        eq(cpmVsaSlotRates.tenantId, session.tenantId),
        isNull(cpmVsaSlotRates.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const statusColor = (s: string) => {
    switch (s) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const details = [
    { label: "VSA Partner", value: item.vsaPartner },
    { label: "Agreement Reference", value: item.agreementReference },
    { label: "Trade Lane", value: item.tradeLane },
    { label: "Service Name", value: item.serviceName },
    { label: "Container Type", value: item.containerType },
    { label: "Container Size", value: item.containerSize },
    { label: "Slot Allocation TEU", value: item.slotAllocationTeu },
    { label: "Slot Cost Per TEU", value: item.slotCostPerTeu },
    { label: "Utilization %", value: item.utilizationPercent != null ? `${item.utilizationPercent}%` : null },
    { label: "Effective From", value: item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleString() : null },
    { label: "Effective To", value: item.effectiveTo ? new Date(item.effectiveTo).toLocaleString() : null },
    { label: "Currency", value: item.currency },
    { label: "Notes", value: item.notes },
    { label: "Created At", value: item.createdAt ? new Date(item.createdAt).toLocaleString() : null },
    { label: "Updated At", value: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/vsa-slot-rates"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{item.vsaPartner}</h1>
          {item.status && (
            <Badge variant={statusColor(item.status)}>{item.status}</Badge>
          )}
        </div>
        <Link
          href={`/commercial-pricing-management/vsa-slot-rates/${item.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{d.label}</p>
              <p className="text-sm">{d.value ?? "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
