import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmSpecialRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-yellow-100 text-yellow-700",
};

export default async function SpecialRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmSpecialRates)
    .where(
      and(
        eq(cpmSpecialRates.id, id),
        eq(cpmSpecialRates.tenantId, session.tenantId),
        isNull(cpmSpecialRates.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const fields: { label: string; value: string | number | null | undefined }[] = [
    { label: "Rate Code", value: item.rateCode },
    { label: "Rate Name", value: item.rateName },
    { label: "Rate Type", value: item.rateType?.replace(/_/g, " ") },
    { label: "Customer ID", value: item.customerId },
    { label: "Customer Segment", value: item.customerSegment },
    { label: "Origin Port", value: item.originPort },
    { label: "Destination Port", value: item.destinationPort },
    { label: "Trade Lane", value: item.tradeLane },
    { label: "Container Type", value: item.containerType },
    { label: "Container Size", value: item.containerSize },
    {
      label: "Base Rate",
      value:
        item.baseRate != null
          ? Number(item.baseRate).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : null,
    },
    {
      label: "Discount %",
      value:
        item.discountPercent != null
          ? Number(item.discountPercent).toFixed(2)
          : null,
    },
    {
      label: "Final Rate",
      value:
        item.finalRate != null
          ? Number(item.finalRate).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : null,
    },
    { label: "Currency", value: item.currency },
    {
      label: "Min Commitment (TEU)",
      value:
        item.minimumCommitmentTeu != null
          ? Number(item.minimumCommitmentTeu)
          : null,
    },
    {
      label: "Effective From",
      value: item.effectiveFrom
        ? new Date(item.effectiveFrom).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null,
    },
    {
      label: "Effective To",
      value: item.effectiveTo
        ? new Date(item.effectiveTo).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null,
    },
    { label: "Notes", value: item.notes },
    {
      label: "Created At",
      value: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
    {
      label: "Updated At",
      value: item.updatedAt
        ? new Date(item.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/commercial-pricing-management/special-rates"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{item.rateName}</h1>
              {item.status && (
                <Badge
                  className={
                    statusVariant[item.status] ?? "bg-gray-100 text-gray-700"
                  }
                >
                  {item.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{item.rateCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/commercial-pricing-management/special-rates/${item.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm font-medium text-gray-500">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm capitalize text-gray-900">
                {field.value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
