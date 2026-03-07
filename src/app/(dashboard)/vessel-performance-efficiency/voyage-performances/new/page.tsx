import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewVoyagePerformancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "vpe:create"))
  )
    redirect("/vessel-performance-efficiency/voyage-performances");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const VOYAGE_PERFORMANCE_FIELDS: FieldConfig[] = [
    {
      name: "performanceType",
      label: "Performance Type",
      type: "select",
      required: true,
      options: [
        { value: "cp_compliance", label: "CP Compliance" },
        { value: "speed_claim", label: "Speed Claim" },
        { value: "consumption_claim", label: "Consumption Claim" },
        { value: "weather_routing", label: "Weather Routing" },
      ],
    },
    { name: "vesselId", label: "Vessel ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageId", label: "Voyage ID", type: "text" },
    { name: "charterPartyId", label: "Charter Party ID", type: "text" },
    { name: "cpSpeed", label: "CP Speed", type: "text" },
    { name: "actualSpeed", label: "Actual Speed", type: "text" },
    { name: "speedVariance", label: "Speed Variance", type: "text" },
    { name: "cpConsumption", label: "CP Consumption", type: "text" },
    { name: "actualConsumption", label: "Actual Consumption", type: "text" },
    {
      name: "consumptionVariance",
      label: "Consumption Variance",
      type: "text",
    },
    { name: "goodWeatherDays", label: "Good Weather Days", type: "text" },
    { name: "badWeatherDays", label: "Bad Weather Days", type: "text" },
    { name: "claimAmount", label: "Claim Amount", type: "text" },
    {
      name: "claimCurrency",
      label: "Claim Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "claimDirection",
      label: "Claim Direction",
      type: "select",
      options: [
        { value: "owner_claim", label: "Owner Claim" },
        { value: "charterer_claim", label: "Charterer Claim" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/voyage-performances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage Performance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Voyage Performance"
          apiPath="/api/v1/vessel-performance-efficiency/voyage-performances"
          fields={VOYAGE_PERFORMANCE_FIELDS}
          returnPath="/vessel-performance-efficiency/voyage-performances"
        />
      </div>
    </div>
  );
}
