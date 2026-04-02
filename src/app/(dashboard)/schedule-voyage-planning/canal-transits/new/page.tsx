import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewCanalTransitPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/canal-transits");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const CANAL_TRANSIT_FIELDS: FieldConfig[] = [
    {
      name: "transitType",
      label: "Transit Type",
      type: "select",
      required: true,
      options: [
        { value: "suez_northbound", label: "Suez Northbound" },
        { value: "suez_southbound", label: "Suez Southbound" },
        { value: "panama_transit", label: "Panama Transit" },
        { value: "kiel_transit", label: "Kiel Transit" },
        { value: "turkish_straits", label: "Turkish Straits" },
      ],
    },
    { name: "canalName", label: "Canal Name", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "bookingNumber", label: "Booking Number", type: "text" },
    { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
    { name: "actualDate", label: "Actual Date", type: "datetime-local" },
    { name: "transitFee", label: "Transit Fee", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "convoyPosition", label: "Convoy Position", type: "number" },
    { name: "pilotRequired", label: "Pilot Required", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/canal-transits"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Canal Transit
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Canal Transit"
          apiPath="/api/v1/schedule-voyage-planning/canal-transits"
          fields={CANAL_TRANSIT_FIELDS}
          returnPath="/schedule-voyage-planning/canal-transits"
        />
      </div>
    </div>
  );
}
