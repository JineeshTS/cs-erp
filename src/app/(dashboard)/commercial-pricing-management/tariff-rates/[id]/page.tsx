import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmTariffRates } from "@/db/schema";

export default async function TariffRateDetailPage({
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
    .from(cpmTariffRates)
    .where(
      and(
        eq(cpmTariffRates.id, id),
        eq(cpmTariffRates.tenantId, session.tenantId),
        isNull(cpmTariffRates.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const fields: { label: string; value: string | number | null | undefined }[] = [
    { label: "Tariff ID", value: item.tariffId },
    { label: "Charge Code", value: item.chargeCode },
    { label: "Charge Name", value: item.chargeName },
    { label: "Charge Type", value: item.chargeType?.replace(/_/g, " ") },
    { label: "Basis", value: item.basis?.replace(/_/g, " ") },
    { label: "Container Type", value: item.containerType },
    { label: "Container Size", value: item.containerSize },
    {
      label: "Unit Price",
      value:
        item.unitPrice != null
          ? Number(item.unitPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : null,
    },
    {
      label: "Minimum Charge",
      value:
        item.minimumCharge != null
          ? Number(item.minimumCharge).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : null,
    },
    {
      label: "Maximum Charge",
      value:
        item.maximumCharge != null
          ? Number(item.maximumCharge).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : null,
    },
    { label: "Currency", value: item.currency },
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
            href="/commercial-pricing-management/tariff-rates"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{item.chargeName}</h1>
            <p className="text-sm text-gray-500">{item.chargeCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/commercial-pricing-management/tariff-rates/${item.id}/edit`}
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
