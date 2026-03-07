import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsFxRates } from "@/db/schema";
import { MelsForm, type FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditFxRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/fx-rates");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    { name: "sourceCurrency", label: "Source Currency", type: "text", required: true, placeholder: "USD" },
    { name: "targetCurrency", label: "Target Currency", type: "select", options: currencyOpts, required: true },
    { name: "rate", label: "Rate (integer)", type: "number", required: true },
    { name: "rateMultiplier", label: "Rate Multiplier", type: "number", placeholder: "1000000" },
    { name: "rateType", label: "Rate Type", type: "select", options: [
      { value: "spot", label: "Spot" }, { value: "forward", label: "Forward" },
      { value: "official", label: "Official" }, { value: "custom", label: "Custom" },
    ]},
    { name: "provider", label: "Provider", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "date", required: true },
    { name: "effectiveTo", label: "Effective To", type: "date" },
    { name: "isActive", label: "Active", type: "checkbox" },
  ];

  const { id } = await params;

  const fxRate = await db
    .select()
    .from(melsFxRates)
    .where(
      and(
        eq(melsFxRates.id, id),
        eq(melsFxRates.tenantId, session.tenantId),
        isNull(melsFxRates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!fxRate) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/fx-rates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit FX Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="FX Rate"
          apiPath={`/api/v1/multi-entity-legal-structure/fx-rates/${id}`}
          fields={FIELDS}
          initialData={{
            sourceCurrency: fxRate.sourceCurrency ?? "",
            targetCurrency: fxRate.targetCurrency ?? "",
            rate: fxRate.rate,
            rateMultiplier: fxRate.rateMultiplier,
            rateType: fxRate.rateType ?? "",
            provider: fxRate.provider ?? "",
            effectiveFrom: fxRate.effectiveFrom
              ? new Date(fxRate.effectiveFrom).toISOString().slice(0, 10)
              : "",
            effectiveTo: fxRate.effectiveTo
              ? new Date(fxRate.effectiveTo).toISOString().slice(0, 10)
              : "",
            isActive: fxRate.isActive,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/fx-rates/${id}`}
        />
      </div>
    </div>
  );
}
