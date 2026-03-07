import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { vessels } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";
import { getCountryOptions } from "@/lib/lookups";

export default async function EditVesselPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:edit")))
    redirect("/master-data-management/vessels");

  const countryOpts = await getCountryOptions();

  const VESSEL_FIELDS = [
    { name: "imoNumber", label: "IMO Number", type: "text" as const, required: true },
    { name: "name", label: "Vessel Name", type: "text" as const, required: true },
    { name: "callSign", label: "Call Sign", type: "text" as const },
    { name: "mmsi", label: "MMSI", type: "text" as const },
    { name: "flag", label: "Flag (2-letter)", type: "select" as const, options: countryOpts },
    { name: "vesselType", label: "Vessel Type", type: "select" as const, options: [
      { value: "container", label: "Container" },
      { value: "bulk_carrier", label: "Bulk Carrier" },
      { value: "tanker", label: "Tanker" },
      { value: "ro_ro", label: "Ro-Ro" },
      { value: "general_cargo", label: "General Cargo" },
      { value: "other", label: "Other" },
    ]},
    { name: "teuCapacity", label: "TEU Capacity", type: "number" as const },
    { name: "dwt", label: "DWT", type: "number" as const },
    { name: "grossTonnage", label: "Gross Tonnage", type: "number" as const },
    { name: "netTonnage", label: "Net Tonnage", type: "number" as const },
    { name: "loa", label: "LOA (m)", type: "number" as const },
    { name: "beam", label: "Beam (m)", type: "number" as const },
    { name: "draft", label: "Draft (m)", type: "number" as const },
    { name: "builtYear", label: "Built Year", type: "number" as const },
    { name: "builder", label: "Builder", type: "text" as const },
    { name: "ownerName", label: "Owner Name", type: "text" as const },
    { name: "operatorName", label: "Operator Name", type: "text" as const },
    { name: "classificationSociety", label: "Classification Society", type: "text" as const },
  ];
  const { id } = await params;

  const vessel = await db
    .select()
    .from(vessels)
    .where(
      and(
        eq(vessels.id, id),
        eq(vessels.tenantId, session.tenantId),
        isNull(vessels.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vessel) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/vessels/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Vessel</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Vessel"
          apiPath={`/api/v1/master-data-management/vessels/${id}`}
          fields={VESSEL_FIELDS}
          initialData={{
            imoNumber: vessel.imoNumber,
            name: vessel.name,
            callSign: vessel.callSign ?? "",
            mmsi: vessel.mmsi ?? "",
            flag: vessel.flag ?? "",
            vesselType: vessel.vesselType,
            teuCapacity: vessel.teuCapacity ?? "",
            dwt: vessel.dwt ? Number(vessel.dwt) : "",
            grossTonnage: vessel.grossTonnage ? Number(vessel.grossTonnage) : "",
            netTonnage: vessel.netTonnage ? Number(vessel.netTonnage) : "",
            loa: vessel.loa ? Number(vessel.loa) : "",
            beam: vessel.beam ? Number(vessel.beam) : "",
            draft: vessel.draft ? Number(vessel.draft) : "",
            builtYear: vessel.builtYear ?? "",
            builder: vessel.builder ?? "",
            ownerName: vessel.ownerName ?? "",
            operatorName: vessel.operatorName ?? "",
            classificationSociety: vessel.classificationSociety ?? "",
          }}
          isEdit
          returnPath={`/master-data-management/vessels/${id}`}
        />
      </div>
    </div>
  );
}
