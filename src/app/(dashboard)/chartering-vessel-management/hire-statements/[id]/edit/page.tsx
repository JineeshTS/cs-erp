import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmHireStatements } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditHireStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const currencyOpts = await getCurrencyOptions();

  const HS_FIELDS: FieldConfig[] = [
    { name: "charterPartyId", label: "Charter Party ID", type: "text", required: true, placeholder: "UUID" },
    { name: "statementNumber", label: "Statement Number", type: "text", required: true },
    { name: "periodFrom", label: "Period From", type: "datetime-local", required: true },
    { name: "periodTo", label: "Period To", type: "datetime-local", required: true },
    { name: "hireDays", label: "Hire Days", type: "number", required: true },
    { name: "hireRate", label: "Hire Rate", type: "number", required: true },
    { name: "grossHire", label: "Gross Hire", type: "number", required: true },
    { name: "offHireDeductions", label: "Off-Hire Deductions", type: "number" },
    { name: "bunkerAdjustments", label: "Bunker Adjustments", type: "number" },
    { name: "otherDeductions", label: "Other Deductions", type: "number" },
    { name: "netHire", label: "Net Hire", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const hs = await db
    .select()
    .from(cvmHireStatements)
    .where(
      and(
        eq(cvmHireStatements.id, id),
        eq(cvmHireStatements.tenantId, session.tenantId),
        isNull(cvmHireStatements.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!hs) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/hire-statements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Hire Statement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Hire Statement"
          apiPath={`/api/v1/chartering-vessel-management/hire-statements/${id}`}
          fields={HS_FIELDS}
          initialData={{
            charterPartyId: hs.charterPartyId,
            statementNumber: hs.statementNumber,
            periodFrom: hs.periodFrom.toISOString(),
            periodTo: hs.periodTo.toISOString(),
            hireDays: Number(hs.hireDays),
            hireRate: Number(hs.hireRate),
            grossHire: Number(hs.grossHire),
            offHireDeductions: hs.offHireDeductions ? Number(hs.offHireDeductions) : "",
            bunkerAdjustments: hs.bunkerAdjustments ? Number(hs.bunkerAdjustments) : "",
            otherDeductions: hs.otherDeductions ? Number(hs.otherDeductions) : "",
            netHire: Number(hs.netHire),
            currency: hs.currency,
            notes: hs.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/hire-statements/${id}`}
        />
      </div>
    </div>
  );
}
