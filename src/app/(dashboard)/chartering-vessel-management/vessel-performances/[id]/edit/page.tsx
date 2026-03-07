import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmVesselPerformances } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditVesselPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const VP_FIELDS: FieldConfig[] = [
    {
      name: "voyageEstimateId",
      label: "Voyage Estimate ID",
      type: "text",
    },
    {
      name: "vesselName",
      label: "Vessel Name",
      type: "select", options: vesselOpts,
      required: true,
    },
    {
      name: "reportDate",
      label: "Report Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "reportType",
      label: "Report Type",
      type: "select",
      options: [
        { value: "noon", label: "Noon" },
        { value: "arrival", label: "Arrival" },
        { value: "departure", label: "Departure" },
        { value: "event", label: "Event" },
      ],
    },
    { name: "latitude", label: "Latitude", type: "number" },
    { name: "longitude", label: "Longitude", type: "number" },
    { name: "speedKnots", label: "Speed (Knots)", type: "number" },
    { name: "consumptionMt", label: "Consumption (MT)", type: "number" },
    { name: "fuelType", label: "Fuel Type", type: "text" },
    { name: "windForce", label: "Wind Force", type: "number" },
    { name: "seaState", label: "Sea State", type: "number" },
    {
      name: "weatherConditions",
      label: "Weather Conditions",
      type: "text",
    },
    { name: "distanceNm", label: "Distance (NM)", type: "number" },
    { name: "slipPercent", label: "Slip %", type: "number" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];
  const { id } = await params;

  const vp = await db
    .select()
    .from(cvmVesselPerformances)
    .where(
      and(
        eq(cvmVesselPerformances.id, id),
        eq(cvmVesselPerformances.tenantId, session.tenantId),
        isNull(cvmVesselPerformances.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vp) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/vessel-performances/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Performance Report
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Performance Report"
          apiPath={`/api/v1/chartering-vessel-management/vessel-performances/${id}`}
          fields={VP_FIELDS}
          initialData={{
            voyageEstimateId: vp.voyageEstimateId ?? "",
            vesselName: vp.vesselName,
            reportDate: vp.reportDate.toISOString(),
            reportType: vp.reportType,
            latitude: vp.latitude ? Number(vp.latitude) : "",
            longitude: vp.longitude ? Number(vp.longitude) : "",
            speedKnots: vp.speedKnots ? Number(vp.speedKnots) : "",
            consumptionMt: vp.consumptionMt ? Number(vp.consumptionMt) : "",
            fuelType: vp.fuelType ?? "",
            windForce: vp.windForce ?? "",
            seaState: vp.seaState ?? "",
            weatherConditions: vp.weatherConditions ?? "",
            distanceNm: vp.distanceNm ? Number(vp.distanceNm) : "",
            slipPercent: vp.slipPercent ? Number(vp.slipPercent) : "",
            remarks: vp.remarks ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/vessel-performances/${id}`}
        />
      </div>
    </div>
  );
}
