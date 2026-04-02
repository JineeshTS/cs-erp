import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmProfitabilityAnalyses } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ProfitabilityAnalysisDetailPage({
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
    .from(cpmProfitabilityAnalyses)
    .where(
      and(
        eq(cpmProfitabilityAnalyses.id, id),
        eq(cpmProfitabilityAnalyses.tenantId, session.tenantId),
        isNull(cpmProfitabilityAnalyses.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const statusColor = (s: string) => {
    switch (s) {
      case "draft":
        return "secondary";
      case "final":
        return "default";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  const details = [
    { label: "Analysis Name", value: item.analysisName },
    { label: "Analysis Type", value: item.analysisType },
    { label: "Trade Lane", value: item.tradeLane },
    { label: "Customer ID", value: item.customerId },
    { label: "Voyage ID", value: item.voyageId },
    { label: "Period From", value: item.periodFrom ? new Date(item.periodFrom).toLocaleDateString() : null },
    { label: "Period To", value: item.periodTo ? new Date(item.periodTo).toLocaleDateString() : null },
    { label: "Total Revenue", value: item.totalRevenue },
    { label: "Total Cost", value: item.totalCost },
    { label: "Gross Profit", value: item.grossProfit },
    { label: "Margin %", value: item.marginPercent != null ? `${item.marginPercent}%` : null },
    { label: "TEU Count", value: item.teuCount },
    { label: "Revenue Per TEU", value: item.revenuePerTeu },
    { label: "Cost Per TEU", value: item.costPerTeu },
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
            href="/commercial-pricing-management/profitability-analyses"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{item.analysisName}</h1>
          {item.status && (
            <Badge variant={statusColor(item.status)}>{item.status}</Badge>
          )}
        </div>
        <Link
          href={`/commercial-pricing-management/profitability-analyses/${item.id}/edit`}
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
