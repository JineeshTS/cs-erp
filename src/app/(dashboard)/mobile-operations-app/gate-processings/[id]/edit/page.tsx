import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGateProcessing } from "@/lib/mobile-operations-app/service";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const GATE_PROCESSING_FIELDS: FieldConfig[] = [
  {
    name: "gateType",
    label: "Gate Type",
    type: "select",
    required: true,
    options: [
      { value: "gate_in", label: "Gate In" },
      { value: "gate_out", label: "Gate Out" },
      { value: "pre_gate", label: "Pre Gate" },
      { value: "re_entry", label: "Re Entry" },
      { value: "emergency_exit", label: "Emergency Exit" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "truckPlate", label: "Truck Plate", type: "text" },
  { name: "driverName", label: "Driver Name", type: "text" },
  { name: "driverLicense", label: "Driver License", type: "text" },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "gateNumber", label: "Gate Number", type: "text" },
  { name: "processedAt", label: "Processed At", type: "datetime-local" },
  { name: "yardLocation", label: "Yard Location", type: "text" },
  { name: "damageFound", label: "Damage Found", type: "checkbox" },
  { name: "photoCount", label: "Photo Count", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditGateProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:edit")))
    redirect("/mobile-operations-app/gate-processings");

  const { id } = await params;

  const record = await getGateProcessing(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/mobile-operations-app/gate-processings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Gate Processing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Gate Processing"
          apiPath={`/api/v1/mobile-operations-app/gate-processings/${id}`}
          fields={GATE_PROCESSING_FIELDS}
          initialData={{
            gateType: record.gateType,
            containerNumber: record.containerNumber ?? "",
            containerSize: record.containerSize ?? "",
            containerType: record.containerType ?? "",
            truckPlate: record.truckPlate ?? "",
            driverName: record.driverName ?? "",
            driverLicense: record.driverLicense ?? "",
            sealNumber: record.sealNumber ?? "",
            gateNumber: record.gateNumber ?? "",
            processedAt: record.processedAt ? record.processedAt.toISOString().slice(0, 16) : "",
            yardLocation: record.yardLocation ?? "",
            damageFound: record.damageFound ?? false,
            photoCount: record.photoCount ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/mobile-operations-app/gate-processings/${id}`}
        />
      </div>
    </div>
  );
}
