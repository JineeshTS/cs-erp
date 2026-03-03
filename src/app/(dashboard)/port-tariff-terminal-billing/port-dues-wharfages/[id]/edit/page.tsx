import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortDuesWharfage } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";

const PORT_DUES_FIELDS: FieldConfig[] = [
  {
    name: "duesType",
    label: "Dues Type",
    type: "select",
    required: true,
    options: [
      { value: "port_dues", label: "Port Dues" },
      { value: "wharfage", label: "Wharfage" },
      { value: "anchorage", label: "Anchorage" },
      { value: "berth_hire", label: "Berth Hire" },
      { value: "channel_dues", label: "Channel Dues" },
    ],
  },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "vesselGrt", label: "Vessel GRT", type: "number" },
  { name: "vesselNrt", label: "Vessel NRT", type: "number" },
  { name: "vesselLoa", label: "Vessel LOA", type: "number" },
  { name: "ratePerGrt", label: "Rate Per GRT", type: "number" },
  { name: "ratePerNrt", label: "Rate Per NRT", type: "number" },
  { name: "calculatedAmount", label: "Calculated Amount", type: "number" },
  { name: "duesCurrency", label: "Dues Currency", type: "text" },
  { name: "berthingHours", label: "Berthing Hours", type: "number" },
  {
    name: "discountPercentage",
    label: "Discount Percentage",
    type: "number",
  },
  {
    name: "effectiveDate",
    label: "Effective Date",
    type: "datetime-local",
  },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPortDuesWharfagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getPortDuesWharfage(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    duesType: record.duesType ?? "",
    portCode: record.portCode ?? "",
    portName: record.portName ?? "",
    vesselName: record.vesselName ?? "",
    vesselGrt: record.vesselGrt ?? "",
    vesselNrt: record.vesselNrt ?? "",
    vesselLoa: record.vesselLoa ?? "",
    ratePerGrt: record.ratePerGrt ?? "",
    ratePerNrt: record.ratePerNrt ?? "",
    calculatedAmount: record.calculatedAmount ?? "",
    duesCurrency: record.duesCurrency ?? "",
    berthingHours:
      record.berthingHours != null ? String(record.berthingHours) : "",
    discountPercentage: record.discountPercentage ?? "",
    effectiveDate: record.effectiveDate
      ? new Date(record.effectiveDate).toISOString().slice(0, 16)
      : "",
    expiryDate: record.expiryDate
      ? new Date(record.expiryDate).toISOString().slice(0, 16)
      : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/port-dues-wharfages/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.duesRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update port dues and wharfage details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Port Dues & Wharfage"
          apiPath={`/api/v1/port-tariff-terminal-billing/port-dues-wharfages/${id}`}
          returnPath="/port-tariff-terminal-billing/port-dues-wharfages"
          fields={PORT_DUES_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
