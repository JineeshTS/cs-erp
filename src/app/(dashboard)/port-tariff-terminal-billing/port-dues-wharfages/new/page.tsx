import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";
import { getPortOptions, getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewPortDuesWharfagePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  const [portOpts, vesselOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "vesselGrt", label: "Vessel GRT", type: "number" },
    { name: "vesselNrt", label: "Vessel NRT", type: "number" },
    { name: "vesselLoa", label: "Vessel LOA", type: "number" },
    { name: "ratePerGrt", label: "Rate Per GRT", type: "number" },
    { name: "ratePerNrt", label: "Rate Per NRT", type: "number" },
    { name: "calculatedAmount", label: "Calculated Amount", type: "number" },
    { name: "duesCurrency", label: "Dues Currency", type: "select", options: currencyOpts },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/port-tariff-terminal-billing/port-dues-wharfages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Port Dues & Wharfage
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new port dues or wharfage record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Port Dues & Wharfage"
          apiPath="/api/v1/port-tariff-terminal-billing/port-dues-wharfages"
          returnPath="/port-tariff-terminal-billing/port-dues-wharfages"
          fields={PORT_DUES_FIELDS}
        />
      </div>
    </div>
  );
}
