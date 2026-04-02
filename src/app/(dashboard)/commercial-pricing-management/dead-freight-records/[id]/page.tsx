import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmDeadFreightRecords } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  calculated: "bg-blue-100 text-blue-800",
  invoiced: "bg-yellow-100 text-yellow-800",
  partially_recovered: "bg-orange-100 text-orange-800",
  recovered: "bg-green-100 text-green-800",
  waived: "bg-gray-100 text-gray-800",
};

export default async function DeadFreightRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmDeadFreightRecords)
    .where(
      and(
        eq(cpmDeadFreightRecords.id, id),
        eq(cpmDeadFreightRecords.tenantId, session.tenantId),
        isNull(cpmDeadFreightRecords.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/dead-freight-records"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{record.recordReference}</h1>
          {record.status && (
            <Badge className={STATUS_COLORS[record.status] ?? ""}>
              {record.status.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <Link
          href={`/commercial-pricing-management/dead-freight-records/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Record Reference</p>
            <p className="mt-1 font-medium">{record.recordReference}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Voyage Reference</p>
            <p className="mt-1 font-medium">{record.voyageReference ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Booking Reference</p>
            <p className="mt-1 font-medium">{record.bookingReference ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer ID</p>
            <p className="mt-1 font-medium">{record.customerId ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trade Lane</p>
            <p className="mt-1 font-medium">{record.tradeLane ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Booked TEU</p>
            <p className="mt-1 font-medium">{record.bookedTeu}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Actual TEU</p>
            <p className="mt-1 font-medium">{record.actualTeu}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Short Shipped TEU</p>
            <p className="mt-1 font-medium">{record.shortShippedTeu}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rate Per TEU</p>
            <p className="mt-1 font-medium">{record.ratePerTeu}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dead Freight Amount</p>
            <p className="mt-1 font-medium">{record.deadFreightAmount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recovered Amount</p>
            <p className="mt-1 font-medium">{record.recoveredAmount ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="mt-1 font-medium">{record.currency ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Waiver Reason</p>
            <p className="mt-1 font-medium">{record.waiverReason ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Waived Amount</p>
            <p className="mt-1 font-medium">{record.waivedAmount ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Invoice ID</p>
            <p className="mt-1 font-medium">{record.invoiceId ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-1 font-medium">
              {record.status ? record.status.replace(/_/g, " ") : "-"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="mt-1 font-medium whitespace-pre-wrap">{record.notes ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="mt-1 font-medium">
              {record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Updated At</p>
            <p className="mt-1 font-medium">
              {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
