import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getImdgCompliance } from "@/lib/dangerous-goods-management/service";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const IMDG_COMPLIANCE_FIELDS: FieldConfig[] = [
  { name: "unNumber", label: "UN Number", type: "text", required: true, placeholder: "e.g. UN1234" },
  { name: "properShippingName", label: "Proper Shipping Name", type: "text", required: true },
  { name: "technicalName", label: "Technical Name", type: "text" },
  { name: "imdgClass", label: "IMDG Class", type: "text", required: true, placeholder: "e.g. 3" },
  { name: "imdgSubsidiaryRisk", label: "IMDG Subsidiary Risk", type: "text" },
  { name: "packingGroup", label: "Packing Group", type: "text", placeholder: "e.g. I, II, III" },
  { name: "marinePollutant", label: "Marine Pollutant", type: "checkbox" },
  { name: "emsNumber", label: "EMS Number", type: "text", placeholder: "e.g. F-E, S-D" },
  { name: "flashPoint", label: "Flash Point", type: "text", placeholder: "e.g. 23°C c.c." },
  { name: "limitedQuantity", label: "Limited Quantity", type: "checkbox" },
  { name: "exceptedQuantity", label: "Excepted Quantity", type: "checkbox" },
  { name: "stowageCategory", label: "Stowage Category", type: "text" },
  { name: "segregationGroup", label: "Segregation Group", type: "text" },
  { name: "imdgCodeEdition", label: "IMDG Code Edition", type: "text", placeholder: "e.g. 41-22" },
  { name: "amendmentNumber", label: "Amendment Number", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditImdgCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:edit")))
    redirect("/dangerous-goods-management/imdg-compliance");

  const { id } = await params;

  const record = await getImdgCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dangerous-goods-management/imdg-compliance/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit IMDG Compliance</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="IMDG Compliance"
          apiPath={`/api/v1/dangerous-goods-management/imdg-compliance/${id}`}
          fields={IMDG_COMPLIANCE_FIELDS}
          initialData={{
            unNumber: record.unNumber,
            properShippingName: record.properShippingName,
            technicalName: record.technicalName ?? "",
            imdgClass: record.imdgClass,
            imdgSubsidiaryRisk: record.imdgSubsidiaryRisk ?? "",
            packingGroup: record.packingGroup ?? "",
            marinePollutant: record.marinePollutant,
            emsNumber: record.emsNumber ?? "",
            flashPoint: record.flashPoint ?? "",
            limitedQuantity: record.limitedQuantity,
            exceptedQuantity: record.exceptedQuantity,
            stowageCategory: record.stowageCategory ?? "",
            segregationGroup: record.segregationGroup ?? "",
            imdgCodeEdition: record.imdgCodeEdition ?? "",
            amendmentNumber: record.amendmentNumber ?? "",
            effectiveFrom: record.effectiveFrom
              ? new Date(record.effectiveFrom).toISOString()
              : "",
            effectiveTo: record.effectiveTo
              ? new Date(record.effectiveTo).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/dangerous-goods-management/imdg-compliance/${id}`}
        />
      </div>
    </div>
  );
}
