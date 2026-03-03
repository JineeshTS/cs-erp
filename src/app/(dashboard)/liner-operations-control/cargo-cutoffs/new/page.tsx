import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  LocForm,
  type FieldConfig,
} from "@/components/liner-operations-control/loc-form";

const CUTOFF_FIELDS: FieldConfig[] = [
  {
    name: "cutoffType",
    label: "Cutoff Type",
    type: "select",
    required: true,
    options: [
      { value: "documentation_cutoff", label: "Documentation Cutoff" },
      { value: "cargo_receiving_cutoff", label: "Cargo Receiving Cutoff" },
      { value: "vgm_cutoff", label: "VGM Cutoff" },
      { value: "hazmat_cutoff", label: "Hazmat Cutoff" },
      { value: "reefer_cutoff", label: "Reefer Cutoff" },
    ],
  },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "cutoffDatetime", label: "Cutoff Datetime", type: "datetime-local" },
  {
    name: "extensionGranted",
    label: "Extension Granted",
    type: "checkbox",
  },
  { name: "extensionUntil", label: "Extension Until", type: "datetime-local" },
  { name: "extensionReason", label: "Extension Reason", type: "textarea" },
  { name: "affectedBookings", label: "Affected Bookings", type: "number" },
  {
    name: "notificationSent",
    label: "Notification Sent",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCargoCutoffPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/liner-operations-control/cargo-cutoffs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Cargo Cutoff
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new cargo cutoff record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <LocForm
          entityType="Cargo Cutoff"
          apiPath="/api/v1/liner-operations-control/cargo-cutoffs"
          returnPath="/liner-operations-control/cargo-cutoffs"
          fields={CUTOFF_FIELDS}
        />
      </div>
    </div>
  );
}
