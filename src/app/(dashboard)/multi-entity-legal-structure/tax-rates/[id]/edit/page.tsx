import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsTaxRates } from "@/db/schema";
import {
  MelsForm,
  type FieldConfig,
} from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "taxConfigId", label: "Tax Config ID", type: "text", required: true },
  {
    name: "rateBps",
    label: "Rate (basis points)",
    type: "number",
    required: true,
  },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "date",
    required: true,
  },
  { name: "effectiveTo", label: "Effective To", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function EditTaxRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/tax-rates");

  const { id } = await params;

  const rate = await db
    .select()
    .from(melsTaxRates)
    .where(
      and(
        eq(melsTaxRates.id, id),
        eq(melsTaxRates.tenantId, session.tenantId),
        isNull(melsTaxRates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!rate) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/tax-rates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tax Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Tax Rate"
          apiPath={`/api/v1/multi-entity-legal-structure/tax-rates/${id}`}
          fields={FIELDS}
          initialData={{
            taxConfigId: rate.taxConfigId,
            rateBps: rate.rateBps,
            effectiveFrom: rate.effectiveFrom.toISOString().slice(0, 10),
            effectiveTo: rate.effectiveTo
              ? rate.effectiveTo.toISOString().slice(0, 10)
              : "",
            description: rate.description ?? "",
            isActive: rate.isActive,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/tax-rates/${id}`}
        />
      </div>
    </div>
  );
}
