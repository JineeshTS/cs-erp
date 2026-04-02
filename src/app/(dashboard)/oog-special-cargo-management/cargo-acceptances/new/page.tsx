import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import React from "react";
import { getPortOptions, getVesselOptions, getCustomerOptions } from "@/lib/lookups";

export default async function NewCargoAcceptancePage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "oog_special:create"))
  )
    redirect("/oog-special-cargo-management/cargo-acceptances");

  const [portOpts, vesselOpts, customerOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);

  const FIELDS: FieldConfig[] = [
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    {
      name: "cargoDescription",
      label: "Cargo Description",
      type: "textarea",
      required: true,
    },
    {
      name: "cargoType",
      label: "Cargo Type",
      type: "select",
      required: true,
      options: [
        { value: "over_length", label: "Over Length" },
        { value: "over_width", label: "Over Width" },
        { value: "over_height", label: "Over Height" },
        { value: "over_weight", label: "Over Weight" },
        { value: "break_bulk", label: "Break Bulk" },
        { value: "project_cargo", label: "Project Cargo" },
      ],
    },
    {
      name: "containerType",
      label: "Container Type",
      type: "select",
      required: true,
      options: [
        { value: "flat_rack", label: "Flat Rack" },
        { value: "open_top", label: "Open Top" },
        { value: "platform", label: "Platform" },
        { value: "bolster", label: "Bolster" },
        { value: "mafi_trailer", label: "Mafi Trailer" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "lengthCm", label: "Length (cm)", type: "text" },
    { name: "widthCm", label: "Width (cm)", type: "text" },
    { name: "heightCm", label: "Height (cm)", type: "text" },
    {
      name: "grossWeightKg",
      label: "Gross Weight (kg)",
      type: "text",
      required: true,
    },
    { name: "overLengthCm", label: "Over-Length (cm)", type: "text" },
    { name: "overWidthCm", label: "Over-Width (cm)", type: "text" },
    { name: "overHeightCm", label: "Over-Height (cm)", type: "text" },
    {
      name: "measurementValidated",
      label: "Measurement Validated",
      type: "checkbox",
    },
    { name: "validatedByName", label: "Validated By", type: "text" },
    { name: "validatedAt", label: "Validated At", type: "datetime-local" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    {
      name: "destinationPort",
      label: "Destination Port",
      type: "select", options: portOpts,
      required: true,
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "hazardous", label: "Hazardous", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/oog-special-cargo-management/cargo-acceptances"
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Cargo Acceptance
          </h1>
          <p className="text-sm text-gray-500">
            Create a new OOG cargo acceptance record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Cargo Acceptance"
          apiPath="/api/v1/oog-special-cargo-management/cargo-acceptances"
          fields={FIELDS}
          returnPath="/oog-special-cargo-management/cargo-acceptances"
        />
      </div>
    </div>
  );
}
