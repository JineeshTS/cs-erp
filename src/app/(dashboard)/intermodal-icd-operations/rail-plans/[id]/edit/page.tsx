import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRailPlan } from "@/lib/intermodal-icd-operations/service";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";

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
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRailPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:edit")))
    redirect("/intermodal-icd-operations/rail-plans");

  const { id } = await params;
  const record = await getRailPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/intermodal-icd-operations/rail-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Rail Plan</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Rail Plan"
          apiPath={`/api/v1/intermodal-icd-operations/rail-plans/${id}`}
          fields={RAIL_PLAN_FIELDS}
          initialData={{
            trainNumber: record.trainNumber ?? "",
            trainOperator: record.trainOperator ?? "",
            originIcd: record.originIcd ?? "",
            destinationIcd: record.destinationIcd ?? "",
            routeDescription: record.routeDescription ?? "",
            wagonCount: record.wagonCount ?? "",
            wagonType: record.wagonType ?? "",
            totalCapacityTeu: record.totalCapacityTeu ?? "",
            bookedTeu: record.bookedTeu ?? "",
            scheduledDepartureAt: record.scheduledDepartureAt
              ? new Date(record.scheduledDepartureAt).toISOString()
              : "",
            scheduledArrivalAt: record.scheduledArrivalAt
              ? new Date(record.scheduledArrivalAt).toISOString()
              : "",
            actualDepartureAt: record.actualDepartureAt
              ? new Date(record.actualDepartureAt).toISOString()
              : "",
            actualArrivalAt: record.actualArrivalAt
              ? new Date(record.actualArrivalAt).toISOString()
              : "",
            transitTimeDays: record.transitTimeDays ?? "",
            railwayCompany: record.railwayCompany ?? "",
            bookingCutoffAt: record.bookingCutoffAt
              ? new Date(record.bookingCutoffAt).toISOString()
              : "",
            estimatedCost: record.estimatedCost ?? "",
            currency: record.currency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/intermodal-icd-operations/rail-plans/${id}`}
        />
      </div>
    </div>
  );
}
