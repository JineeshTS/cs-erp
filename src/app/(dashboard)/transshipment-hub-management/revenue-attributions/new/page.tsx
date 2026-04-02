import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewRevenueAttributionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/revenue-attributions");

  const currencyOpts = await getCurrencyOptions();

  const REVENUE_ATTRIBUTION_FIELDS: FieldConfig[] = [
    {
      name: "attributionType",
      label: "Attribution Type",
      type: "select",
      required: true,
      options: [
        { value: "leg_allocation", label: "Leg Allocation" },
        { value: "hub_cost_sharing", label: "Hub Cost Sharing" },
        { value: "feeder_revenue", label: "Feeder Revenue" },
        { value: "mother_revenue", label: "Mother Revenue" },
        { value: "margin_analysis", label: "Margin Analysis" },
      ],
    },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "hubPort", label: "Hub Port", type: "text" },
    { name: "legFrom", label: "Leg From", type: "text" },
    { name: "legTo", label: "Leg To", type: "text" },
    { name: "freightRevenue", label: "Freight Revenue", type: "text" },
    { name: "handlingCost", label: "Handling Cost", type: "text" },
    { name: "hubCost", label: "Hub Cost", type: "text" },
    { name: "netMargin", label: "Net Margin", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "marginPct", label: "Margin %", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/revenue-attributions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Revenue Attribution
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Revenue Attribution"
          apiPath="/api/v1/transshipment-hub-management/revenue-attributions"
          fields={REVENUE_ATTRIBUTION_FIELDS}
          returnPath="/transshipment-hub-management/revenue-attributions"
        />
      </div>
    </div>
  );
}
