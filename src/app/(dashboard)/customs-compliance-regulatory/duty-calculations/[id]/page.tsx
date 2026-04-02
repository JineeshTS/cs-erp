import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDutyCalculation } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";

export default async function DutyCalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;
  const record = await getDutyCalculation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/duty-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.calculationRef}
          </h1>
          <p className="text-sm text-gray-500">Duty Calculation</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customs-compliance-regulatory/duty-calculations/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Calculation Ref</dt>
            <dd className="mt-1 text-gray-900">{record.calculationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Clearance Ref</dt>
            <dd className="mt-1 text-gray-900">{record.clearanceRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">HS Code</dt>
            <dd className="mt-1 text-gray-900">{record.hsCode || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">HS Description</dt>
            <dd className="mt-1 text-gray-900">{record.hsDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Country</dt>
            <dd className="mt-1 text-gray-900">{record.originCountry || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Country</dt>
            <dd className="mt-1 text-gray-900">{record.destinationCountry || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Valuation Method</dt>
            <dd className="mt-1 text-gray-900">{record.valuationMethod || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CIF Value</dt>
            <dd className="mt-1 text-gray-900">{record.cifValue || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CIF Currency</dt>
            <dd className="mt-1 text-gray-900">{record.cifCurrency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exchange Rate</dt>
            <dd className="mt-1 text-gray-900">{record.exchangeRate || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Duty Rate</dt>
            <dd className="mt-1 text-gray-900">{record.dutyRate || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Duty Amount</dt>
            <dd className="mt-1 text-gray-900">{record.dutyAmount || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">VAT Rate</dt>
            <dd className="mt-1 text-gray-900">{record.vatRate || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">VAT Amount</dt>
            <dd className="mt-1 text-gray-900">{record.vatAmount || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Excise Rate</dt>
            <dd className="mt-1 text-gray-900">{record.exciseRate || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Excise Amount</dt>
            <dd className="mt-1 text-gray-900">{record.exciseAmount || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Anti-dumping Duty</dt>
            <dd className="mt-1 text-gray-900">{record.antidumpingDuty || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Safeguard Duty</dt>
            <dd className="mt-1 text-gray-900">{record.safeguardDuty || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Duty/Tax</dt>
            <dd className="mt-1 text-gray-900">{record.totalDutyTax || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Preferential Tariff</dt>
            <dd className="mt-1 text-gray-900">
              {record.preferentialTariff ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FTA Reference</dt>
            <dd className="mt-1 text-gray-900">{record.ftaReference || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exemption Code</dt>
            <dd className="mt-1 text-gray-900">{record.exemptionCode || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Exemption Reason</dt>
            <dd className="mt-1 text-gray-900">{record.exemptionReason || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Calculated By</dt>
            <dd className="mt-1 text-gray-900">{record.calculatedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Calculated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.calculatedAt?.toLocaleDateString() ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : record.status === "pending"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
