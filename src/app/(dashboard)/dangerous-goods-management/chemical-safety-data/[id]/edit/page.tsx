import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getChemicalSafetyDataRecord } from "@/lib/dangerous-goods-management/service";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const CHEMICAL_SAFETY_DATA_FIELDS: FieldConfig[] = [
  { name: "chemicalName", label: "Chemical Name", type: "text", required: true },
  { name: "casNumber", label: "CAS Number", type: "text" },
  { name: "unNumber", label: "UN Number", type: "text" },
  { name: "imdgClass", label: "IMDG Class", type: "text" },
  { name: "manufacturer", label: "Manufacturer", type: "text" },
  { name: "supplierName", label: "Supplier Name", type: "text" },
  { name: "sdsVersion", label: "SDS Version", type: "text" },
  { name: "sdsDate", label: "SDS Date", type: "datetime-local" },
  { name: "hazardIdentification", label: "Hazard Identification", type: "textarea" },
  { name: "firstAidMeasures", label: "First Aid Measures", type: "textarea" },
  { name: "firefightingMeasures", label: "Firefighting Measures", type: "textarea" },
  { name: "accidentalRelease", label: "Accidental Release", type: "textarea" },
  { name: "handlingAndStorage", label: "Handling and Storage", type: "textarea" },
  { name: "exposureControls", label: "Exposure Controls", type: "textarea" },
  { name: "stabilityReactivity", label: "Stability and Reactivity", type: "textarea" },
  { name: "toxicologicalInfo", label: "Toxicological Info", type: "textarea" },
  { name: "ecologicalInfo", label: "Ecological Info", type: "textarea" },
  { name: "disposalConsiderations", label: "Disposal Considerations", type: "textarea" },
  { name: "transportInfo", label: "Transport Info", type: "textarea" },
  { name: "regulatoryInfo", label: "Regulatory Info", type: "textarea" },
  { name: "sdsDocumentUrl", label: "SDS Document URL", type: "text" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditChemicalSafetyDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:edit")))
    redirect("/dangerous-goods-management/chemical-safety-data");

  const { id } = await params;

  const record = await getChemicalSafetyDataRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dangerous-goods-management/chemical-safety-data/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Chemical Safety Data
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Chemical Safety Data"
          apiPath={`/api/v1/dangerous-goods-management/chemical-safety-data/${id}`}
          fields={CHEMICAL_SAFETY_DATA_FIELDS}
          initialData={{
            chemicalName: record.chemicalName ?? "",
            casNumber: record.casNumber ?? "",
            unNumber: record.unNumber ?? "",
            imdgClass: record.imdgClass ?? "",
            manufacturer: record.manufacturer ?? "",
            supplierName: record.supplierName ?? "",
            sdsVersion: record.sdsVersion ?? "",
            sdsDate: record.sdsDate ? new Date(record.sdsDate).toISOString() : "",
            hazardIdentification: record.hazardIdentification ?? "",
            firstAidMeasures: record.firstAidMeasures ?? "",
            firefightingMeasures: record.firefightingMeasures ?? "",
            accidentalRelease: record.accidentalRelease ?? "",
            handlingAndStorage: record.handlingAndStorage ?? "",
            exposureControls: record.exposureControls ?? "",
            stabilityReactivity: record.stabilityReactivity ?? "",
            toxicologicalInfo: record.toxicologicalInfo ?? "",
            ecologicalInfo: record.ecologicalInfo ?? "",
            disposalConsiderations: record.disposalConsiderations ?? "",
            transportInfo: record.transportInfo ?? "",
            regulatoryInfo: record.regulatoryInfo ?? "",
            sdsDocumentUrl: record.sdsDocumentUrl ?? "",
            expiryDate: record.expiryDate ? new Date(record.expiryDate).toISOString() : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/dangerous-goods-management/chemical-safety-data/${id}`}
        />
      </div>
    </div>
  );
}
