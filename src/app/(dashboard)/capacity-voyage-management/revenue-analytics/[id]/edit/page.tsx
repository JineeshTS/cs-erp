import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capRevenueAnalytics } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditRevenueAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const FIELDS: FieldConfig[] = [
    {
      name: "vesselScheduleId",
      label: "Vessel Schedule ID",
      type: "text",
    },
    {
      name: "tradeLane",
      label: "Trade Lane",
      type: "text",
    },
    {
      name: "originPort",
      label: "Origin Port",
      type: "select", options: portOpts,
    },
    {
      name: "destinationPort",
      label: "Destination Port",
      type: "select", options: portOpts,
    },
    {
      name: "periodFrom",
      label: "Period From",
      type: "datetime-local",
      required: true,
    },
    {
      name: "periodTo",
      label: "Period To",
      type: "datetime-local",
      required: true,
    },
    {
      name: "totalTeu",
      label: "Total TEU",
      type: "number",
    },
    {
      name: "totalRevenue",
      label: "Total Revenue",
      type: "number",
    },
    {
      name: "revenuePerTeu",
      label: "Revenue per TEU",
      type: "number",
    },
    {
      name: "averageRate",
      label: "Average Rate",
      type: "number",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "calculated", label: "Calculated" },
        { value: "published", label: "Published" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  const { id } = await params;
  const ra = await db
    .select()
    .from(capRevenueAnalytics)
    .where(
      and(
        eq(capRevenueAnalytics.id, id),
        eq(capRevenueAnalytics.tenantId, session.tenantId),
        isNull(capRevenueAnalytics.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ra) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: ra.vesselScheduleId ?? "",
    tradeLane: ra.tradeLane ?? "",
    originPort: ra.originPort ?? "",
    destinationPort: ra.destinationPort ?? "",
    periodFrom: ra.periodFrom?.toISOString() ?? "",
    periodTo: ra.periodTo?.toISOString() ?? "",
    totalTeu: ra.totalTeu ?? "",
    totalRevenue: ra.totalRevenue ?? "",
    revenuePerTeu: ra.revenuePerTeu ?? "",
    averageRate: ra.averageRate ?? "",
    currency: ra.currency,
    status: ra.status,
    notes: ra.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/revenue-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Revenue Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Revenue Analytics"
          apiPath={`/api/v1/capacity-voyage-management/revenue-analytics/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/revenue-analytics/${id}`}
        />
      </div>
    </div>
  );
}
