import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm, type FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewHeavyLiftPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:create")))
    redirect("/");

  const [portOpts, vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "projectName", label: "Project Name", type: "text", required: true },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea", required: true },
    { name: "numberOfPieces", label: "Number of Pieces", type: "number", required: true },
    { name: "totalWeightKg", label: "Total Weight (kg)", type: "text", required: true },
    { name: "heaviestPieceKg", label: "Heaviest Piece (kg)", type: "text" },
    { name: "longestPieceCm", label: "Longest Piece (cm)", type: "text" },
    { name: "widestPieceCm", label: "Widest Piece (cm)", type: "text" },
    { name: "tallestPieceCm", label: "Tallest Piece (cm)", type: "text" },
    { name: "liftingMethod", label: "Lifting Method", type: "select", options: [{ value: "shore_crane", label: "Shore Crane" }, { value: "ship_crane", label: "Ship Crane" }, { value: "floating_crane", label: "Floating Crane" }, { value: "roll_on", label: "Roll On" }, { value: "skidding", label: "Skidding" }] },
    { name: "craneCapacityTons", label: "Crane Capacity (tons)", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts, required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "estimatedLoadDate", label: "Est. Load Date", type: "datetime-local" },
    { name: "estimatedDischargeDate", label: "Est. Discharge Date", type: "datetime-local" },
    { name: "coordinatorName", label: "Coordinator Name", type: "text" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyReportUrl", label: "Survey Report URL", type: "text" },
    { name: "insuranceCoverage", label: "Insurance Coverage", type: "text" },
    { name: "estimatedCost", label: "Estimated Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/oog-special-cargo-management/heavy-lifts"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Heavy Lift</h1>
          <p className="text-sm text-gray-500">Create a new heavy lift record</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Heavy Lift"
          apiPath="/api/v1/oog-special-cargo-management/heavy-lifts"
          fields={fields}
          returnPath="/oog-special-cargo-management/heavy-lifts"
        />
      </div>
    </div>
  );
}
