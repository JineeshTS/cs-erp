import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmBlCharges } from "@/db/schema";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function BlChargeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

  const { id } = await params;

  const record = await db
    .select()
    .from(odmBlCharges)
    .where(
      and(
        eq(odmBlCharges.id, id),
        eq(odmBlCharges.tenantId, session.tenantId),
        isNull(odmBlCharges.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "operations:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "operations:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/bl-charges" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.chargeName}</h1>
          <p className="text-sm text-gray-500">BL Charge Details</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/operations-documentation/bl-charges/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/bl-charges/${id}`} />
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Charge Code", value: record.chargeCode },
            { label: "Charge Name", value: record.chargeName },
            { label: "Charge Type", value: record.chargeType },
            { label: "Amount", value: record.amount.toString() },
            { label: "Currency", value: record.currency ?? "USD" },
            { label: "Prepaid/Collect", value: record.prepaidCollect ?? "-" },
            { label: "Notes", value: record.notes ?? "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
