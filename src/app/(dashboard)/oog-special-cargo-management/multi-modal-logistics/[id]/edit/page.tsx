import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMultiModalLogistic } from "@/lib/oog-special-cargo-management/service";
import { OogForm, type FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditMultiModalLogisticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:edit")))
    redirect("/");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    { name: "acceptanceRef", label: "Acceptance Ref", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "transportMode", label: "Transport Mode", type: "select", required: true, options: [{ value: "road", label: "Road" }, { value: "rail", label: "Rail" }, { value: "barge", label: "Barge" }, { value: "sea", label: "Sea" }, { value: "multimodal", label: "Multimodal" }] },
    { name: "carrierName", label: "Carrier Name", type: "text" },
    { name: "vehicleId", label: "Vehicle ID", type: "text" },
    { name: "originLocation", label: "Origin Location", type: "text", required: true },
    { name: "destinationLocation", label: "Destination Location", type: "text", required: true },
    { name: "permitRequired", label: "Permit Required", type: "checkbox" },
    { name: "permitNumber", label: "Permit Number", type: "text" },
    { name: "escortRequired", label: "Escort Required", type: "checkbox" },
    { name: "estimatedDepartureAt", label: "Est. Departure", type: "datetime-local" },
    { name: "estimatedArrivalAt", label: "Est. Arrival", type: "datetime-local" },
    { name: "actualDepartureAt", label: "Actual Departure", type: "datetime-local" },
    { name: "actualArrivalAt", label: "Actual Arrival", type: "datetime-local" },
    { name: "transportCost", label: "Transport Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const record = await getMultiModalLogistic(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    acceptanceRef: record.acceptanceRef ?? "",
    containerNumber: record.containerNumber ?? "",
    cargoDescription: record.cargoDescription ?? "",
    transportMode: record.transportMode ?? "",
    carrierName: record.carrierName ?? "",
    vehicleId: record.vehicleId ?? "",
    originLocation: record.originLocation ?? "",
    destinationLocation: record.destinationLocation ?? "",
    permitRequired: record.permitRequired ?? false,
    permitNumber: record.permitNumber ?? "",
    escortRequired: record.escortRequired ?? false,
    estimatedDepartureAt: record.estimatedDepartureAt ? new Date(record.estimatedDepartureAt).toISOString() : "",
    estimatedArrivalAt: record.estimatedArrivalAt ? new Date(record.estimatedArrivalAt).toISOString() : "",
    actualDepartureAt: record.actualDepartureAt ? new Date(record.actualDepartureAt).toISOString() : "",
    actualArrivalAt: record.actualArrivalAt ? new Date(record.actualArrivalAt).toISOString() : "",
    transportCost: record.transportCost ?? "",
    currency: record.currency ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/oog-special-cargo-management/multi-modal-logistics/${id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Multi-Modal Logistic</h1>
          <p className="text-sm text-gray-500">{record.logisticsRef}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Multi-Modal Logistic"
          apiPath={`/api/v1/oog-special-cargo-management/multi-modal-logistics/${id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath={`/oog-special-cargo-management/multi-modal-logistics/${id}`}
        />
      </div>
    </div>
  );
}
