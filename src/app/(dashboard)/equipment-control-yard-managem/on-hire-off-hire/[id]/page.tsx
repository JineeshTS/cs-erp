import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyOnHireOffHire } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

function fmtCurrency(amount: number | null, currency: string): string {
  if (amount === null) return "-";
  return `${currency} ${amount.toLocaleString()}`;
}

export default async function OnHireOffHireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem/on-hire-off-hire");

  const { id } = await params;

  const record = await db
    .select()
    .from(eqyOnHireOffHire)
    .where(
      and(
        eq(eqyOnHireOffHire.id, id),
        eq(eqyOnHireOffHire.tenantId, session.tenantId),
        isNull(eqyOnHireOffHire.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "active":
        return "success" as const;
      case "pending_off_hire":
        return "default" as const;
      case "off_hired":
        return "secondary" as const;
      case "disputed":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/on-hire-off-hire"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.contractReference}
          </h1>
          <p className="text-sm text-gray-500">
            On-Hire / Off-Hire &middot; {record.containerNumber}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/equipment-control-yard-managem/on-hire-off-hire/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Contract Reference</dt>
            <dd className="mt-1 text-gray-900">{record.contractReference}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lessor Name</dt>
            <dd className="mt-1 text-gray-900">{record.lessorName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lessee Name</dt>
            <dd className="mt-1 text-gray-900">{record.lesseeName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hire Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.hireType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">On-Hire Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.onHireDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Off-Hire Date</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(record.offHireDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">On-Hire Location</dt>
            <dd className="mt-1 text-gray-900">{record.onHireLocation ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Off-Hire Location</dt>
            <dd className="mt-1 text-gray-900">{record.offHireLocation ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Daily Rate</dt>
            <dd className="mt-1 text-gray-900">
              {fmtCurrency(record.dailyRate, record.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Days</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalDays !== null ? record.totalDays : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-gray-900">
              {fmtCurrency(record.totalCost, record.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Condition On Hire</dt>
            <dd className="mt-1 text-gray-900">{record.conditionOnHire ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Condition Off Hire</dt>
            <dd className="mt-1 text-gray-900">{record.conditionOffHire ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Damage Charges</dt>
            <dd className="mt-1 text-gray-900">
              {fmtCurrency(record.damageCharges, record.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cleaning Charges</dt>
            <dd className="mt-1 text-gray-900">
              {fmtCurrency(record.cleaningCharges, record.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {record.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
