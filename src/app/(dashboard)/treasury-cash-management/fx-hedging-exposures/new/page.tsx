import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewFxHedgingExposurePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/fx-hedging-exposures");

  const currencyOpts = await getCurrencyOptions();

  const FX_HEDGING_FIELDS: FieldConfig[] = [
    {
      name: "hedgeType",
      label: "Hedge Type",
      type: "select",
      required: true,
      options: [
        { value: "forward", label: "Forward" },
        { value: "option", label: "Option" },
        { value: "swap", label: "Swap" },
        { value: "natural_hedge", label: "Natural Hedge" },
        { value: "cross_currency", label: "Cross Currency" },
      ],
    },
    { name: "baseCurrency", label: "Base Currency", type: "select", options: currencyOpts },
    { name: "quoteCurrency", label: "Quote Currency", type: "text", placeholder: "QAR" },
    { name: "notionalAmount", label: "Notional Amount", type: "text" },
    { name: "hedgedAmount", label: "Hedged Amount", type: "text" },
    { name: "spotRate", label: "Spot Rate", type: "text" },
    { name: "forwardRate", label: "Forward Rate", type: "text" },
    { name: "strikeRate", label: "Strike Rate", type: "text" },
    { name: "maturityDate", label: "Maturity Date", type: "datetime-local" },
    { name: "settlementDate", label: "Settlement Date", type: "datetime-local" },
    { name: "counterparty", label: "Counterparty", type: "text" },
    { name: "dealReference", label: "Deal Reference", type: "text" },
    { name: "hedgeEffectiveness", label: "Hedge Effectiveness", type: "text" },
    { name: "unrealizedGainLoss", label: "Unrealized Gain/Loss", type: "text" },
    { name: "realizedGainLoss", label: "Realized Gain/Loss", type: "text" },
    { name: "exposureType", label: "Exposure Type", type: "text" },
    { name: "hedgeAccountingMethod", label: "Hedge Accounting Method", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/fx-hedging-exposures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New FX Hedging Exposure
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="FX Hedging Exposure"
          apiPath="/api/v1/treasury-cash-management/fx-hedging-exposures"
          fields={FX_HEDGING_FIELDS}
          returnPath="/treasury-cash-management/fx-hedging-exposures"
        />
      </div>
    </div>
  );
}
