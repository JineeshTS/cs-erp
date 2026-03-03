import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSlotSwapCoordination } from "@/lib/liner-operations-control/service";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const SLOT_SWAP_FIELDS: FieldConfig[] = [
  {
    name: "swapType",
    label: "Swap Type",
    type: "select",
    required: true,
    options: [
      { value: "slot_purchase", label: "Slot Purchase" },
      { value: "slot_sale", label: "Slot Sale" },
      { value: "slot_exchange", label: "Slot Exchange" },
      { value: "capacity_share", label: "Capacity Share" },
      { value: "emergency_swap", label: "Emergency Swap" },
    ],
  },
  { name: "partnerName", label: "Partner Name", type: "text" },
  { name: "partnerCode", label: "Partner Code", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "tradeRoute", label: "Trade Route", type: "text" },
  { name: "slotsOffered", label: "Slots Offered", type: "number" },
  { name: "slotsReceived", label: "Slots Received", type: "number" },
  { name: "ratePerSlot", label: "Rate Per Slot", type: "number" },
  { name: "totalValue", label: "Total Value", type: "number" },
  { name: "swapCurrency", label: "Swap Currency", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSlotSwapCoordinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getSlotSwapCoordination(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    swapType: record.swapType ?? "",
    partnerName: record.partnerName ?? "",
    partnerCode: record.partnerCode ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    tradeRoute: record.tradeRoute ?? "",
    slotsOffered: record.slotsOffered != null ? String(record.slotsOffered) : "",
    slotsReceived: record.slotsReceived != null ? String(record.slotsReceived) : "",
    ratePerSlot: record.ratePerSlot ?? "",
    totalValue: record.totalValue ?? "",
    swapCurrency: record.swapCurrency ?? "",
    effectiveFrom: record.effectiveFrom
      ? new Date(record.effectiveFrom).toISOString().slice(0, 16)
      : "",
    effectiveTo: record.effectiveTo
      ? new Date(record.effectiveTo).toISOString().slice(0, 16)
      : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/liner-operations-control/slot-swap-coordinations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.swapRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update slot swap coordination details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Slot Swap Coordination"
          apiPath={`/api/v1/liner-operations-control/slot-swap-coordinations/${id}`}
          returnPath="/liner-operations-control/slot-swap-coordinations"
          fields={SLOT_SWAP_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
