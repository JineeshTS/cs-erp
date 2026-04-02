import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHeavyLift } from "@/lib/oog-special-cargo-management/service";
import { OogForm, type FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditHeavyLiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:edit")))
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

  const record = await getHeavyLift(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    projectName: record.projectName ?? "",
    customerName: record.customerName ?? "",
    cargoDescription: record.cargoDescription ?? "",
    numberOfPieces: record.numberOfPieces ?? "",
    totalWeightKg: record.totalWeightKg ?? "",
    heaviestPieceKg: record.heaviestPieceKg ?? "",
    longestPieceCm: record.longestPieceCm ?? "",
    widestPieceCm: record.widestPieceCm ?? "",
    tallestPieceCm: record.tallestPieceCm ?? "",
    liftingMethod: record.liftingMethod ?? "",
    craneCapacityTons: record.craneCapacityTons ?? "",
    originPort: record.originPort ?? "",
    destinationPort: record.destinationPort ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    estimatedLoadDate: record.estimatedLoadDate ? new Date(record.estimatedLoadDate).toISOString() : "",
    estimatedDischargeDate: record.estimatedDischargeDate ? new Date(record.estimatedDischargeDate).toISOString() : "",
    coordinatorName: record.coordinatorName ?? "",
    surveyorName: record.surveyorName ?? "",
    surveyReportUrl: record.surveyReportUrl ?? "",
    insuranceCoverage: record.insuranceCoverage ?? "",
    estimatedCost: record.estimatedCost ?? "",
    currency: record.currency ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/oog-special-cargo-management/heavy-lifts/${id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Heavy Lift</h1>
          <p className="text-sm text-gray-500">{record.heavyLiftRef}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Heavy Lift"
          apiPath={`/api/v1/oog-special-cargo-management/heavy-lifts/${id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath={`/oog-special-cargo-management/heavy-lifts/${id}`}
        />
      </div>
    </div>
  );
}
