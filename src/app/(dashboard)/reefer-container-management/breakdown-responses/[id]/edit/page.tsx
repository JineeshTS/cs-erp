import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBreakdownResponse } from "@/lib/reefer-container-management/service";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditBreakdownResponsePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const BREAKDOWN_RESPONSE_FIELDS: FieldConfig[] = [
    {
      name: "containerNumber",
      label: "Container Number",
      type: "text",
      required: true,
    },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    {
      name: "breakdownType",
      label: "Breakdown Type",
      type: "select",
      required: true,
      options: [
        { value: "compressor_failure", label: "Compressor Failure" },
        { value: "refrigerant_leak", label: "Refrigerant Leak" },
        { value: "electrical_fault", label: "Electrical Fault" },
        { value: "controller_malfunction", label: "Controller Malfunction" },
        { value: "sensor_failure", label: "Sensor Failure" },
        { value: "structural_damage", label: "Structural Damage" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "severityLevel",
      label: "Severity Level",
      type: "select",
      required: true,
      options: [
        { value: "minor", label: "Minor" },
        { value: "moderate", label: "Moderate" },
        { value: "major", label: "Major" },
        { value: "critical", label: "Critical" },
      ],
    },
    {
      name: "reportedAt",
      label: "Reported At",
      type: "datetime-local",
      required: true,
    },
    { name: "locationDescription", label: "Location Description", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    {
      name: "faultDescription",
      label: "Fault Description",
      type: "textarea",
      required: true,
    },
    { name: "faultCode", label: "Fault Code", type: "text" },
    { name: "lastKnownTempC", label: "Last Known Temp (C)", type: "text" },
    { name: "cargoAtRisk", label: "Cargo at Risk", type: "checkbox" },
    { name: "commodityName", label: "Commodity Name", type: "text" },
    { name: "immediateAction", label: "Immediate Action", type: "textarea" },
    { name: "technicianName", label: "Technician Name", type: "text" },
    {
      name: "responseStartedAt",
      label: "Response Started At",
      type: "datetime-local",
    },
    { name: "repairDescription", label: "Repair Description", type: "textarea" },
    { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
    {
      name: "totalDowntimeMinutes",
      label: "Total Downtime (min)",
      type: "number",
    },
    { name: "repairCost", label: "Repair Cost", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "containerSwapped", label: "Container Swapped", type: "checkbox" },
    { name: "swappedToContainer", label: "Swapped to Container", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getBreakdownResponse(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/breakdown-responses/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Breakdown Response
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Breakdown Response"
          apiPath={`/api/v1/reefer-container-management/breakdown-responses/${id}`}
          fields={BREAKDOWN_RESPONSE_FIELDS}
          initialData={{
            containerNumber: record.containerNumber,
            bookingRef: record.bookingRef ?? "",
            breakdownType: record.breakdownType,
            severityLevel: record.severityLevel,
            reportedAt: record.reportedAt
              ? new Date(record.reportedAt).toISOString()
              : "",
            locationDescription: record.locationDescription ?? "",
            vesselName: record.vesselName ?? "",
            voyageNumber: record.voyageNumber ?? "",
            faultDescription: record.faultDescription ?? "",
            faultCode: record.faultCode ?? "",
            lastKnownTempC: record.lastKnownTempC ?? "",
            cargoAtRisk: record.cargoAtRisk ?? false,
            commodityName: record.commodityName ?? "",
            immediateAction: record.immediateAction ?? "",
            technicianName: record.technicianName ?? "",
            responseStartedAt: record.responseStartedAt
              ? new Date(record.responseStartedAt).toISOString()
              : "",
            repairDescription: record.repairDescription ?? "",
            resolvedAt: record.resolvedAt
              ? new Date(record.resolvedAt).toISOString()
              : "",
            totalDowntimeMinutes: record.totalDowntimeMinutes ?? "",
            repairCost: record.repairCost ?? "",
            currency: record.currency ?? "",
            containerSwapped: record.containerSwapped ?? false,
            swappedToContainer: record.swappedToContainer ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/breakdown-responses/${id}`}
        />
      </div>
    </div>
  );
}
