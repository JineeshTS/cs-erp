import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPilotageTowageCharge } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

const PILOTAGE_TOWAGE_FIELDS: FieldConfig[] = [
  {
    name: "chargeType",
    label: "Charge Type",
    type: "select",
    required: true,
    options: [
      { value: "pilotage_inbound", label: "Pilotage Inbound" },
      { value: "pilotage_outbound", label: "Pilotage Outbound" },
      { value: "towage", label: "Towage" },
      { value: "mooring", label: "Mooring" },
      { value: "unmooring", label: "Unmooring" },
    ],
  },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "vesselGrt", label: "Vessel GRT", type: "number" },
  { name: "vesselLoa", label: "Vessel LOA", type: "number" },
  { name: "numberOfTugs", label: "Number of Tugs", type: "number" },
  { name: "tugHours", label: "Tug Hours", type: "number" },
  { name: "pilotageDistance", label: "Pilotage Distance", type: "number" },
  { name: "ratePerGrt", label: "Rate Per GRT", type: "number" },
  { name: "baseCharge", label: "Base Charge", type: "number" },
  { name: "calculatedAmount", label: "Calculated Amount", type: "number" },
  { name: "chargeCurrency", label: "Charge Currency", type: "text" },
  { name: "nightSurcharge", label: "Night Surcharge", type: "checkbox" },
  { name: "weekendSurcharge", label: "Weekend Surcharge", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPilotageTowageChargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getPilotageTowageCharge(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    chargeType: record.chargeType ?? "",
    portCode: record.portCode ?? "",
    portName: record.portName ?? "",
    vesselName: record.vesselName ?? "",
    vesselGrt: record.vesselGrt ?? "",
    vesselLoa: record.vesselLoa ?? "",
    numberOfTugs:
      record.numberOfTugs != null ? String(record.numberOfTugs) : "",
    tugHours: record.tugHours ?? "",
    pilotageDistance: record.pilotageDistance ?? "",
    ratePerGrt: record.ratePerGrt ?? "",
    baseCharge: record.baseCharge ?? "",
    calculatedAmount: record.calculatedAmount ?? "",
    chargeCurrency: record.chargeCurrency ?? "",
    nightSurcharge: record.nightSurcharge ? "true" : "",
    weekendSurcharge: record.weekendSurcharge ? "true" : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/pilotage-towage-charges/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.chargeRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update pilotage &amp; towage charge details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Pilotage & Towage Charge"
          apiPath={`/api/v1/port-tariff-terminal-billing/pilotage-towage-charges/${id}`}
          returnPath="/port-tariff-terminal-billing/pilotage-towage-charges"
          fields={PILOTAGE_TOWAGE_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
