import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { commodities } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const COMMODITY_FIELDS = [
  { name: "hsCode", label: "HS Code", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const, required: true },
  { name: "shortDescription", label: "Short Description", type: "text" as const },
  { name: "category", label: "Category", type: "text" as const },
  { name: "chapter", label: "Chapter", type: "text" as const },
  { name: "hazardClass", label: "Hazard Class", type: "text" as const },
  { name: "unNumber", label: "UN Number", type: "text" as const },
  { name: "unitOfMeasure", label: "Unit of Measure", type: "text" as const },
  { name: "requiresFumigation", label: "Requires Fumigation", type: "checkbox" as const },
  { name: "requiresInspection", label: "Requires Inspection", type: "checkbox" as const },
  { name: "isRestricted", label: "Is Restricted", type: "checkbox" as const },
  { name: "dutyRate", label: "Duty Rate (%)", type: "number" as const },
];

export default async function EditCommodityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:edit")))
    redirect("/master-data-management/commodities");

  const { id } = await params;

  const commodity = await db
    .select()
    .from(commodities)
    .where(
      and(
        eq(commodities.id, id),
        eq(commodities.tenantId, session.tenantId),
        isNull(commodities.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!commodity) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/commodities/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Commodity</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Commodity"
          apiPath={`/api/v1/master-data-management/commodities/${id}`}
          fields={COMMODITY_FIELDS}
          initialData={{
            hsCode: commodity.hsCode,
            description: commodity.description,
            shortDescription: commodity.shortDescription ?? "",
            category: commodity.category ?? "",
            chapter: commodity.chapter ?? "",
            hazardClass: commodity.hazardClass ?? "",
            unNumber: commodity.unNumber ?? "",
            unitOfMeasure: commodity.unitOfMeasure,
            requiresFumigation: commodity.requiresFumigation,
            requiresInspection: commodity.requiresInspection,
            isRestricted: commodity.isRestricted,
            dutyRate: commodity.dutyRate ? Number(commodity.dutyRate) : "",
          }}
          isEdit
          returnPath={`/master-data-management/commodities/${id}`}
        />
      </div>
    </div>
  );
}
