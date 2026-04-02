import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const CONTAINER_REDELIVERY_FIELDS: FieldConfig[] = [
  {
    name: "redeliveryType",
    label: "Redelivery Type",
    type: "select",
    options: [
      { value: "scheduled_return", label: "Scheduled Return" },
      { value: "early_return", label: "Early Return" },
      { value: "late_return", label: "Late Return" },
      { value: "drop_off", label: "Drop Off" },
      { value: "swap", label: "Swap" },
    ],
  },
  { name: "agreementId", label: "Agreement ID", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "redeliveryLocation", label: "Redelivery Location", type: "text" },
  { name: "depotName", label: "Depot Name", type: "text" },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "actualDate", label: "Actual Date", type: "datetime-local" },
  { name: "conditionOnReturn", label: "Condition on Return", type: "text" },
  { name: "cleaningRequired", label: "Cleaning Required", type: "checkbox" },
  { name: "repairRequired", label: "Repair Required", type: "checkbox" },
  {
    name: "penaltyApplicable",
    label: "Penalty Applicable",
    type: "checkbox",
  },
  { name: "penaltyAmount", label: "Penalty Amount", type: "text" },
  { name: "dropoffCharges", label: "Dropoff Charges", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewContainerRedeliveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/container-leasing-management/container-redeliveries"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Container Redelivery
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new container redelivery record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Container Redelivery"
          apiPath="/api/v1/container-leasing-management/container-redeliveries"
          returnPath="/container-leasing-management/container-redeliveries"
          fields={CONTAINER_REDELIVERY_FIELDS}
        />
      </div>
    </div>
  );
}
