import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";
import React from "react";

const FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  {
    name: "voyageNumber",
    label: "Voyage Number",
    type: "text",
    required: true,
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
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
  { name: "bayPosition", label: "Bay Position", type: "text" },
  { name: "rowPosition", label: "Row Position", type: "text" },
  { name: "tierPosition", label: "Tier Position", type: "text" },
  { name: "weightKg", label: "Weight (kg)", type: "text" },
  { name: "overLengthFore", label: "Over-Length Fore (cm)", type: "text" },
  { name: "overLengthAft", label: "Over-Length Aft (cm)", type: "text" },
  { name: "overWidthPort", label: "Over-Width Port (cm)", type: "text" },
  {
    name: "overWidthStarboard",
    label: "Over-Width Starboard (cm)",
    type: "text",
  },
  { name: "overHeight", label: "Over-Height (cm)", type: "text" },
  { name: "stackable", label: "Stackable", type: "checkbox" },
  { name: "clearanceRequired", label: "Clearance Required", type: "checkbox" },
  { name: "lashingPoints", label: "Lashing Points", type: "number" },
  { name: "planApproved", label: "Plan Approved", type: "checkbox" },
  { name: "approvedByName", label: "Approved By", type: "text" },
  { name: "approvedAt", label: "Approved At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewStowagePlanPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "oog_special:create"))
  )
    redirect("/oog-special-cargo-management/stowage-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/oog-special-cargo-management/stowage-plans"
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Stowage Plan
          </h1>
          <p className="text-sm text-gray-500">
            Create a new OOG stowage plan record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Stowage Plan"
          apiPath="/api/v1/oog-special-cargo-management/stowage-plans"
          fields={FIELDS}
          returnPath="/oog-special-cargo-management/stowage-plans"
        />
      </div>
    </div>
  );
}
