import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm, type FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewMultiModalLogisticPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:create")))
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/oog-special-cargo-management/multi-modal-logistics"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Multi-Modal Logistic</h1>
          <p className="text-sm text-gray-500">Create a new multi-modal logistics record</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Multi-Modal Logistic"
          apiPath="/api/v1/oog-special-cargo-management/multi-modal-logistics"
          fields={fields}
          returnPath="/oog-special-cargo-management/multi-modal-logistics"
        />
      </div>
    </div>
  );
}
