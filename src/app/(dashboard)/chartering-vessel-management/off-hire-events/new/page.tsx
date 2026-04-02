import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewOffHireEventPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "chartering:create"))
  )
    redirect("/chartering-vessel-management");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const OH_FIELDS: FieldConfig[] = [
    {
      name: "charterPartyId",
      label: "Charter Party ID",
      type: "text",
      required: true,
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    {
      name: "eventType",
      label: "Event Type",
      type: "select",
      options: [
        { value: "breakdown", label: "Breakdown" },
        { value: "drydock", label: "Drydock" },
        { value: "deviation", label: "Deviation" },
        { value: "strike", label: "Strike" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "reason",
      label: "Reason",
      type: "textarea",
      required: true,
    },
    {
      name: "startAt",
      label: "Start At",
      type: "datetime-local",
      required: true,
    },
    { name: "endAt", label: "End At", type: "datetime-local" },
    { name: "offHireDays", label: "Off-Hire Days", type: "number" },
    { name: "hireRate", label: "Hire Rate", type: "number" },
    { name: "offHireAmount", label: "Off-Hire Amount", type: "number" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "claimStatus",
      label: "Claim Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "submitted", label: "Submitted" },
        { value: "agreed", label: "Agreed" },
        { value: "disputed", label: "Disputed" },
        { value: "settled", label: "Settled" },
      ],
    },
    { name: "claimReference", label: "Claim Reference", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/off-hire-events"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Off-Hire Event
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Off-Hire Event"
          apiPath="/api/v1/chartering-vessel-management/off-hire-events"
          fields={OH_FIELDS}
          returnPath="/chartering-vessel-management/off-hire-events"
        />
      </div>
    </div>
  );
}
