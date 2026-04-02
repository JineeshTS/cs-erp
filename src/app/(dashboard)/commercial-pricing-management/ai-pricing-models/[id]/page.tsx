import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmAiPricingModels } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AiPricingModelDetailPage({
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
    .from(cpmAiPricingModels)
    .where(
      and(
        eq(cpmAiPricingModels.id, id),
        eq(cpmAiPricingModels.tenantId, session.tenantId),
        isNull(cpmAiPricingModels.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const details = [
    { label: "Model Name", value: item.modelName },
    { label: "Model Code", value: item.modelCode },
    { label: "Model Type", value: item.modelType },
    { label: "Trade Lane", value: item.tradeLane },
    { label: "Training Data From", value: item.trainingDataFrom ? new Date(item.trainingDataFrom).toLocaleDateString() : null },
    { label: "Training Data To", value: item.trainingDataTo ? new Date(item.trainingDataTo).toLocaleDateString() : null },
    { label: "Accuracy", value: item.accuracy != null ? `${item.accuracy}%` : null },
    { label: "Confidence Threshold", value: item.confidenceThreshold },
    { label: "Predicted Rate", value: item.predictedRate },
    { label: "Suggested Rate", value: item.suggestedRate },
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
            href="/commercial-pricing-management/ai-pricing-models"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{item.modelName}</h1>
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Link
          href={`/commercial-pricing-management/ai-pricing-models/${item.id}/edit`}
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
