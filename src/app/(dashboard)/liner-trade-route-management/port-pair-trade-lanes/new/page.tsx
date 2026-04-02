import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewPortPairTradeLanePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "liner:create"))
  )
    redirect("/liner-trade-route-management/port-pair-trade-lanes");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const TRADE_LANE_FIELDS: FieldConfig[] = [
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    { name: "originCountry", label: "Origin Country", type: "text", required: true },
    { name: "originRegion", label: "Origin Region", type: "text" },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts, required: true },
    { name: "destinationCountry", label: "Destination Country", type: "text", required: true },
    { name: "destinationRegion", label: "Destination Region", type: "text" },
    {
      name: "tradeDirection",
      label: "Trade Direction",
      type: "select",
      required: true,
      options: [
        { value: "eastbound", label: "Eastbound" },
        { value: "westbound", label: "Westbound" },
        { value: "northbound", label: "Northbound" },
        { value: "southbound", label: "Southbound" },
        { value: "intra_regional", label: "Intra-Regional" },
      ],
    },
    { name: "distanceNm", label: "Distance (NM)", type: "number" },
    { name: "averageTransitDays", label: "Average Transit Days", type: "number" },
    { name: "competitorCount", label: "Competitor Count", type: "number" },
    { name: "marketSharePercent", label: "Market Share (%)", type: "text" },
    { name: "avgFreightRate", label: "Avg Freight Rate", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/port-pair-trade-lanes"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Port Pair Trade Lane
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Port Pair Trade Lane"
          apiPath="/api/v1/liner-trade-route-management/port-pair-trade-lanes"
          fields={TRADE_LANE_FIELDS}
          returnPath="/liner-trade-route-management/port-pair-trade-lanes"
        />
      </div>
    </div>
  );
}
