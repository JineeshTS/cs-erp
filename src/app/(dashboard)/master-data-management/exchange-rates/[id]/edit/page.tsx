import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { exchangeRates } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditExchangeRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:edit")))
    redirect("/master-data-management/exchange-rates");

  const currencyOpts = await getCurrencyOptions();

  const EXCHANGE_RATE_FIELDS = [
    { name: "baseCurrency", label: "Base Currency", type: "select" as const, options: currencyOpts, required: true },
    { name: "targetCurrency", label: "Target Currency", type: "select" as const, options: currencyOpts, required: true },
    { name: "rate", label: "Rate", type: "text" as const, required: true },
    { name: "inverseRate", label: "Inverse Rate", type: "text" as const },
    { name: "source", label: "Source", type: "text" as const, placeholder: "manual" },
    { name: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
    { name: "validUntil", label: "Valid Until", type: "date" as const },
  ];
  const [rate] = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.id, id),
        eq(exchangeRates.tenantId, session.tenantId),
        isNull(exchangeRates.deletedAt)
      )
    )
    .limit(1);

  if (!rate) notFound();

  const initialData: Record<string, unknown> = {
    baseCurrency: rate.baseCurrency,
    targetCurrency: rate.targetCurrency,
    rate: rate.rate,
    inverseRate: rate.inverseRate ?? "",
    source: rate.source ?? "",
    effectiveDate: rate.effectiveDate,
    validUntil: rate.validUntil ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/exchange-rates/${rate.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Exchange Rate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Exchange Rate"
          apiPath={`/api/v1/master-data-management/exchange-rates/${rate.id}`}
          fields={EXCHANGE_RATE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/master-data-management/exchange-rates/${rate.id}`}
        />
      </div>
    </div>
  );
}
