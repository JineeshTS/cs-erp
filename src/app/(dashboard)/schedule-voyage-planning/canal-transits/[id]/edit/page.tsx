import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCanalTransit } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

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
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "bookingNumber", label: "Booking Number", type: "text" },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "actualDate", label: "Actual Date", type: "datetime-local" },
  { name: "transitFee", label: "Transit Fee", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "convoyPosition", label: "Convoy Position", type: "number" },
  { name: "pilotRequired", label: "Pilot Required", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCanalTransitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/canal-transits");

  const { id } = await params;

  const record = await getCanalTransit(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/canal-transits/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Canal Transit
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Canal Transit"
          apiPath={`/api/v1/schedule-voyage-planning/canal-transits/${id}`}
          fields={CANAL_TRANSIT_FIELDS}
          initialData={{
            transitType: record.transitType,
            canalName: record.canalName ?? "",
            vesselName: record.vesselName ?? "",
            bookingNumber: record.bookingNumber ?? "",
            scheduledDate: record.scheduledDate ? record.scheduledDate.toISOString().slice(0, 16) : "",
            actualDate: record.actualDate ? record.actualDate.toISOString().slice(0, 16) : "",
            transitFee: record.transitFee ?? "",
            currency: record.currency ?? "",
            convoyPosition: record.convoyPosition ?? "",
            pilotRequired: record.pilotRequired ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/canal-transits/${id}`}
        />
      </div>
    </div>
  );
}
