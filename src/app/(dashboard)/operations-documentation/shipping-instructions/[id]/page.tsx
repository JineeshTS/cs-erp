import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmShippingInstructions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ShippingInstructionDetailPage({
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
    .from(odmShippingInstructions)
    .where(
      and(
        eq(odmShippingInstructions.id, id),
        eq(odmShippingInstructions.tenantId, session.tenantId),
        isNull(odmShippingInstructions.deletedAt)
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
        <Link href="/operations-documentation/shipping-instructions" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.siReference}</h1>
          <p className="text-sm text-gray-500">{record.shipperName} &rarr; {record.consigneeName}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/operations-documentation/shipping-instructions/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/operations-documentation/shipping-instructions/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "SI Reference", value: record.siReference },
            { label: "Booking Reference", value: record.bookingReference ?? "-" },
            { label: "Customer Name", value: record.customerName ?? "-" },
            { label: "Shipper Name", value: record.shipperName },
            { label: "Consignee Name", value: record.consigneeName },
            { label: "Notify Party", value: record.notifyPartyName ?? "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={record.status === "approved" ? "success" : record.status === "draft" ? "secondary" : record.status === "rejected" ? "destructive" : "default"}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
        {record.shipperAddress && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Shipper Address</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.shipperAddress}</p>
          </div>
        )}
        {record.consigneeAddress && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Consignee Address</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.consigneeAddress}</p>
          </div>
        )}
        {record.cargoDescription && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Cargo Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.cargoDescription}</p>
          </div>
        )}
        {record.specialInstructions && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Special Instructions</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.specialInstructions}</p>
          </div>
        )}
        {record.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
