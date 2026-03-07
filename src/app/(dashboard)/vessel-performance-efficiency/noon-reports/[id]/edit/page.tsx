import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getNoonReport } from "@/lib/vessel-performance-efficiency/service";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditNoonReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/noon-reports");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const NOON_REPORT_FIELDS: FieldConfig[] = [
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      required: true,
      options: [
        { value: "noon", label: "Noon" },
        { value: "departure", label: "Departure" },
        { value: "arrival", label: "Arrival" },
        { value: "event", label: "Event" },
        { value: "bunker", label: "Bunker" },
      ],
    },
    { name: "vesselId", label: "Vessel ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageId", label: "Voyage ID", type: "text" },
    {
      name: "reportDatetime",
      label: "Report Datetime",
      type: "datetime-local",
    },
    { name: "latitude", label: "Latitude", type: "text" },
    { name: "longitude", label: "Longitude", type: "text" },
    { name: "courseHeading", label: "Course Heading", type: "text" },
    {
      name: "distanceSinceLastReport",
      label: "Distance Since Last Report",
      type: "text",
    },
    { name: "distanceToGo", label: "Distance To Go", type: "text" },
    { name: "avgSpeed", label: "Avg Speed", type: "text" },
    { name: "windDirection", label: "Wind Direction", type: "text" },
    { name: "windForce", label: "Wind Force", type: "number" },
    { name: "seaState", label: "Sea State", type: "text" },
    { name: "swellHeight", label: "Swell Height", type: "text" },
    { name: "robFo", label: "ROB FO", type: "text" },
    { name: "robDo", label: "ROB DO", type: "text" },
    { name: "robLo", label: "ROB LO", type: "text" },
    { name: "meConsumption", label: "ME Consumption", type: "text" },
    { name: "aeConsumption", label: "AE Consumption", type: "text" },
    {
      name: "boilerConsumption",
      label: "Boiler Consumption",
      type: "text",
    },
    { name: "eta", label: "ETA", type: "datetime-local" },
    { name: "masterRemarks", label: "Master Remarks", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getNoonReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/noon-reports/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Noon Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Noon Report"
          apiPath={`/api/v1/vessel-performance-efficiency/noon-reports/${id}`}
          fields={NOON_REPORT_FIELDS}
          initialData={{
            reportType: record.reportType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            voyageId: record.voyageId ?? "",
            reportDatetime: record.reportDatetime
              ? record.reportDatetime.toISOString()
              : "",
            latitude: record.latitude ?? "",
            longitude: record.longitude ?? "",
            courseHeading: record.courseHeading ?? "",
            distanceSinceLastReport: record.distanceSinceLastReport ?? "",
            distanceToGo: record.distanceToGo ?? "",
            avgSpeed: record.avgSpeed ?? "",
            windDirection: record.windDirection ?? "",
            windForce: record.windForce ?? "",
            seaState: record.seaState ?? "",
            swellHeight: record.swellHeight ?? "",
            robFo: record.robFo ?? "",
            robDo: record.robDo ?? "",
            robLo: record.robLo ?? "",
            meConsumption: record.meConsumption ?? "",
            aeConsumption: record.aeConsumption ?? "",
            boilerConsumption: record.boilerConsumption ?? "",
            eta: record.eta
              ? record.eta.toISOString()
              : "",
            masterRemarks: record.masterRemarks ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/noon-reports/${id}`}
        />
      </div>
    </div>
  );
}
