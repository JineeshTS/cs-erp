import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";
import { getPortOptions } from "@/lib/lookups";

export default async function NewContainerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:create")))
    redirect("/equipment-control-yard-managem");

  const portOpts = await getPortOptions(session.tenantId);

  const CONTAINER_FIELDS: FieldConfig[] = [
    { name: "containerNumber", label: "Container Number", type: "text", required: true, placeholder: "ABCU1234567" },
    { name: "isoTypeCode", label: "ISO Type Code", type: "text", placeholder: "22G1" },
    { name: "sizeCode", label: "Size Code", type: "select", required: true, options: [
      { value: "20", label: "20ft" },
      { value: "40", label: "40ft" },
      { value: "45", label: "45ft" },
    ]},
    { name: "typeCode", label: "Type Code", type: "select", required: true, options: [
      { value: "GP", label: "General Purpose" },
      { value: "HC", label: "High Cube" },
      { value: "RF", label: "Reefer" },
      { value: "OT", label: "Open Top" },
      { value: "FR", label: "Flat Rack" },
      { value: "TK", label: "Tank" },
    ]},
    { name: "ownerCode", label: "Owner Code", type: "text" },
    { name: "operatorCode", label: "Operator Code", type: "text" },
    { name: "ownershipType", label: "Ownership Type", type: "select", options: [
      { value: "owned", label: "Owned" },
      { value: "leased", label: "Leased" },
      { value: "third_party", label: "Third Party" },
    ]},
    { name: "currentLocation", label: "Current Location", type: "text" },
    { name: "currentPort", label: "Current Port", type: "select", options: portOpts },
    { name: "currentStatus", label: "Current Status", type: "select", options: [
      { value: "available", label: "Available" },
      { value: "in_use", label: "In Use" },
      { value: "under_repair", label: "Under Repair" },
      { value: "off_hired", label: "Off-Hired" },
      { value: "scrapped", label: "Scrapped" },
    ]},
    { name: "manufacturer", label: "Manufacturer", type: "text" },
    { name: "buildDate", label: "Build Date", type: "datetime-local" },
    { name: "tareWeightKg", label: "Tare Weight (kg)", type: "number" },
    { name: "maxGrossWeightKg", label: "Max Gross Weight (kg)", type: "number" },
    { name: "capacityCbm", label: "Capacity (CBM)", type: "number" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "retired", label: "Retired" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Container
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Container"
          apiPath="/api/v1/equipment-control-yard-managem/container-fleet"
          fields={CONTAINER_FIELDS}
          returnPath="/equipment-control-yard-managem"
        />
      </div>
    </div>
  );
}
