import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CspForm } from "@/components/customer-portal/csp-form";
import type { FieldConfig } from "@/components/customer-portal/csp-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:create")))
    redirect("/customer-portal/tracking");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "blNumber",
      label: "BL Number",
      type: "text",
      placeholder: "e.g. MAEU123456789",
    },
    {
      name: "containerNumber",
      label: "Container Number",
      type: "text",
      placeholder: "e.g. MSKU1234567",
    },
    {
      name: "vesselName",
      label: "Vessel Name",
      type: "select", options: vesselOpts,
    },
    {
      name: "voyageNumber",
      label: "Voyage Number",
      type: "text",
      placeholder: "e.g. 001E",
    },
    {
      name: "originPort",
      label: "Origin Port",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "destinationPort",
      label: "Destination Port",
      type: "select", options: portOpts,
      required: true,
    },
    {
      name: "currentPort",
      label: "Current Port",
      type: "text",
      placeholder: "e.g. QADOH",
    },
    {
      name: "currentStatus",
      label: "Current Status",
      type: "select",
      options: [
        { value: "booked", label: "Booked" },
        { value: "in_transit", label: "In Transit" },
        { value: "at_port", label: "At Port" },
        { value: "customs_hold", label: "Customs Hold" },
        { value: "delivered", label: "Delivered" },
        { value: "returned", label: "Returned" },
      ],
    },
    {
      name: "eta",
      label: "ETA",
      type: "datetime-local",
    },
    {
      name: "etd",
      label: "ETD",
      type: "datetime-local",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes about this shipment...",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/tracking"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Tracking Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Tracking Record"
          apiPath="/api/v1/customer-portal/tracking"
          fields={fields}
          returnPath="/customer-portal/tracking"
        />
      </div>
    </div>
  );
}
