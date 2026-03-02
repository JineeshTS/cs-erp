import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDemurrageCalculation } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  pending: "warning",
  calculated: "success",
  invoiced: "secondary",
  disputed: "destructive",
  closed: "secondary",
};

export default async function DemurrageCalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const calc = await getDemurrageCalculation(id, session.tenantId);
  if (!calc) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/demurrage-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {calc.calculationRef}
          </h1>
          <p className="text-sm text-gray-500">
            Demurrage Calculation Details
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/demurrage-calculations/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{calc.calculationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{calc.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Size</dt>
            <dd className="mt-1 text-gray-900">{calc.containerSize ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{calc.containerType ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{calc.bookingRef ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">{calc.blNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="mt-1 text-gray-900">{calc.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port</dt>
            <dd className="mt-1 text-gray-900">{calc.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Country</dt>
            <dd className="mt-1 text-gray-900">{calc.portCountry ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Terminal</dt>
            <dd className="mt-1 text-gray-900">{calc.terminalName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Discharge Date</dt>
            <dd className="mt-1 text-gray-900">
              {calc.dischargeDate
                ? new Date(calc.dischargeDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gate Out Date</dt>
            <dd className="mt-1 text-gray-900">
              {calc.gateOutDate
                ? new Date(calc.gateOutDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Free Time Days</dt>
            <dd className="mt-1 text-gray-900">{calc.freeTimeDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Free Time Expiry</dt>
            <dd className="mt-1 text-gray-900">
              {calc.freeTimeExpiry
                ? new Date(calc.freeTimeExpiry).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Demurrage Days</dt>
            <dd className="mt-1 text-gray-900">{calc.demurrageDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Daily Rate</dt>
            <dd className="mt-1 text-gray-900">{calc.dailyRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">
              {calc.totalAmount ? `${calc.currency ?? ""} ${calc.totalAmount}` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{calc.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tariff Name</dt>
            <dd className="mt-1 text-gray-900">{calc.tariffName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auto Calculated</dt>
            <dd className="mt-1 text-gray-900">
              {calc.autoCalculated ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[calc.status] ?? "secondary"}>
                {calc.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{calc.notes ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
