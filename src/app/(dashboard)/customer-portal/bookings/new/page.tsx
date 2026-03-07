import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CspForm } from "@/components/customer-portal/csp-form";
import type { FieldConfig } from "@/components/customer-portal/csp-form";
import {
  getPortOptions,
  getCustomerOptions,
  getContainerTypeOptions,
} from "@/lib/customer-portal/lookups";

function buildBookingFields(
  customerOpts: { value: string; label: string }[],
  portOpts: { value: string; label: string }[],
  containerTypeOpts: { value: string; label: string }[]
): FieldConfig[] {
  return [
    {
      name: "customerName",
      label: "Customer",
      type: "select",
      required: true,
      options: customerOpts,
    },
    {
      name: "originPort",
      label: "Origin Port",
      type: "select",
      required: true,
      options: portOpts,
    },
    {
      name: "destinationPort",
      label: "Destination Port",
      type: "select",
      required: true,
      options: portOpts,
    },
    {
      name: "cargoType",
      label: "Cargo Type",
      type: "select",
      required: true,
      options: [
        { value: "general", label: "General" },
        { value: "reefer", label: "Reefer" },
        { value: "hazardous", label: "Hazardous" },
        { value: "bulk", label: "Bulk" },
        { value: "breakbulk", label: "Breakbulk" },
        { value: "roro", label: "RoRo" },
        { value: "tank", label: "Tank" },
        { value: "oversized", label: "Oversized" },
      ],
    },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    {
      name: "containerType",
      label: "Container Type",
      type: "select",
      options: containerTypeOpts,
    },
    { name: "containerCount", label: "Container Count", type: "number" },
    { name: "weight", label: "Weight (kg)", type: "number" },
    { name: "volume", label: "Volume (cbm)", type: "number" },
    { name: "preferredVesselDate", label: "Preferred Vessel Date", type: "datetime-local" },
    { name: "hazardous", label: "Hazardous", type: "checkbox" },
    { name: "temperature", label: "Temperature (C)", type: "number" },
    {
      name: "incoterm",
      label: "Incoterm",
      type: "select",
      options: [
        { value: "FOB", label: "FOB" },
        { value: "CIF", label: "CIF" },
        { value: "CFR", label: "CFR" },
        { value: "EXW", label: "EXW" },
        { value: "FCA", label: "FCA" },
        { value: "CPT", label: "CPT" },
        { value: "CIP", label: "CIP" },
        { value: "DAP", label: "DAP" },
        { value: "DPU", label: "DPU" },
        { value: "DDP", label: "DDP" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
}

export default async function NewBookingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "portal:create"))
  )
    redirect("/customer-portal/bookings");

  const [customerOpts, portOpts, containerTypeOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getPortOptions(session.tenantId),
    getContainerTypeOptions(session.tenantId),
  ]);

  const fields = buildBookingFields(customerOpts, portOpts, containerTypeOpts);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/bookings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Booking</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Booking"
          apiPath="/api/v1/customer-portal/bookings"
          fields={fields}
          returnPath="/customer-portal/bookings"
        />
      </div>
    </div>
  );
}
