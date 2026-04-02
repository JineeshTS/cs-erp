import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsCurrencyConfigs } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  {
    name: "legalEntityId",
    label: "Legal Entity ID",
    type: "text",
    required: true,
  },
  {
    name: "currencyCode",
    label: "Currency Code",
    type: "text",
    required: true,
    placeholder: "QAR",
  },
  {
    name: "currencyName",
    label: "Currency Name",
    type: "text",
    required: true,
  },
  { name: "symbol", label: "Symbol", type: "text" },
  { name: "decimalPlaces", label: "Decimal Places", type: "number" },
  { name: "smallestUnit", label: "Smallest Unit", type: "number" },
  { name: "isBaseCurrency", label: "Base Currency", type: "checkbox" },
  { name: "isEnabled", label: "Enabled", type: "checkbox" },
];

export default async function EditCurrencyConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/currency-configs");

  const [config] = await db
    .select()
    .from(melsCurrencyConfigs)
    .where(
      and(
        eq(melsCurrencyConfigs.id, id),
        eq(melsCurrencyConfigs.tenantId, session.tenantId),
        isNull(melsCurrencyConfigs.deletedAt)
      )
    )
    .limit(1);

  if (!config) notFound();

  const initialData: Record<string, unknown> = {
    legalEntityId: config.legalEntityId,
    currencyCode: config.currencyCode,
    currencyName: config.currencyName,
    symbol: config.symbol ?? "",
    decimalPlaces: config.decimalPlaces,
    smallestUnit: config.smallestUnit,
    isBaseCurrency: config.isBaseCurrency,
    isEnabled: config.isEnabled,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/currency-configs/${config.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Currency Configuration
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Currency Config"
          apiPath={`/api/v1/multi-entity-legal-structure/currency-configs/${config.id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/multi-entity-legal-structure/currency-configs/${config.id}`}
        />
      </div>
    </div>
  );
}
