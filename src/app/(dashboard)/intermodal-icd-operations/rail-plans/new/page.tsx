import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewRailPlanPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "intermodal:create"))
  )
    redirect("/intermodal-icd-operations/rail-plans");

  const currencyOpts = await getCurrencyOptions();

  const RAIL_PLAN_FIELDS: FieldConfig[] = [
    { name: "trainNumber", label: "Train Number", type: "text" },
    { name: "trainOperator", label: "Train Operator", type: "text" },
    { name: "originIcd", label: "Origin ICD", type: "text", required: true },
    {
      name: "destinationIcd",
      label: "Destination ICD",
      type: "text",
      required: true,
    },
    { name: "routeDescription", label: "Route Description", type: "textarea" },
    { name: "wagonCount", label: "Wagon Count", type: "number" },
    {
      name: "wagonType",
      label: "Wagon Type",
      type: "select",
      options: [
        { value: "flat", label: "Flat" },
        { value: "container", label: "Container" },
        { value: "mixed", label: "Mixed" },
      ],
    },
    { name: "totalCapacityTeu", label: "Total Capacity (TEU)", type: "number" },
    { name: "bookedTeu", label: "Booked TEU", type: "number" },
    {
      name: "scheduledDepartureAt",
      label: "Scheduled Departure",
      type: "datetime-local",
    },
    {
      name: "scheduledArrivalAt",
      label: "Scheduled Arrival",
      type: "datetime-local",
    },
    {
      name: "actualDepartureAt",
      label: "Actual Departure",
      type: "datetime-local",
    },
    {
      name: "actualArrivalAt",
      label: "Actual Arrival",
      type: "datetime-local",
    },
    { name: "transitTimeDays", label: "Transit Time (days)", type: "number" },
    { name: "railwayCompany", label: "Railway Company", type: "text" },
    {
      name: "bookingCutoffAt",
      label: "Booking Cutoff",
      type: "datetime-local",
    },
    { name: "estimatedCost", label: "Estimated Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/rail-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Rail Plan</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Rail Plan"
          apiPath="/api/v1/intermodal-icd-operations/rail-plans"
          fields={RAIL_PLAN_FIELDS}
          returnPath="/intermodal-icd-operations/rail-plans"
        />
      </div>
    </div>
  );
}
