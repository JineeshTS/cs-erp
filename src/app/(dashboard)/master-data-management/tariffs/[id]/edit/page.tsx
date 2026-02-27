import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { tariffCodes } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const TARIFF_FIELDS = [
  {
    name: "code",
    label: "Tariff Code",
    type: "text" as const,
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    required: true,
  },
  {
    name: "rateType",
    label: "Rate Type",
    type: "select" as const,
    required: true,
    options: [
      { value: "flat", label: "Flat" },
      { value: "per_unit", label: "Per Unit" },
      { value: "percentage", label: "Percentage" },
      { value: "tiered", label: "Tiered" },
    ],
  },
  {
    name: "rateAmount",
    label: "Rate Amount",
    type: "number" as const,
    required: true,
  },
  {
    name: "currency",
    label: "Currency",
    type: "text" as const,
    placeholder: "USD",
  },
  {
    name: "perUnit",
    label: "Per Unit",
    type: "text" as const,
    placeholder: "TEU",
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "date" as const,
    required: true,
  },
  {
    name: "effectiveTo",
    label: "Effective To",
    type: "date" as const,
  },
];

export default async function EditTariffCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:approve")))
    redirect("/master-data-management/tariffs");

  const [tariff] = await db
    .select()
    .from(tariffCodes)
    .where(
      and(
        eq(tariffCodes.id, id),
        eq(tariffCodes.tenantId, session.tenantId),
        isNull(tariffCodes.deletedAt)
      )
    )
    .limit(1);

  if (!tariff) notFound();

  const initialData: Record<string, unknown> = {
    code: tariff.code,
    description: tariff.description,
    rateType: tariff.rateType,
    rateAmount: tariff.rateAmount,
    currency: tariff.currency,
    perUnit: tariff.perUnit,
    effectiveFrom: tariff.effectiveFrom,
    effectiveTo: tariff.effectiveTo ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/tariffs/${tariff.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Tariff Code: {tariff.code}
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Tariff Code"
          apiPath={`/api/v1/master-data-management/tariffs/${tariff.id}`}
          fields={TARIFF_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/master-data-management/tariffs/${tariff.id}`}
        />
      </div>
    </div>
  );
}
