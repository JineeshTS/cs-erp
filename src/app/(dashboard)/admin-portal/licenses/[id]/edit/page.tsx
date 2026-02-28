import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminLicenses } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const LICENSE_FIELDS: FieldConfig[] = [
  { name: "licenseKey", label: "License Key", type: "text", required: true },
  {
    name: "licenseName",
    label: "License Name",
    type: "text",
    required: true,
  },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "licenseType",
    label: "License Type",
    type: "select",
    options: [
      { value: "subscription", label: "Subscription" },
      { value: "perpetual", label: "Perpetual" },
      { value: "trial", label: "Trial" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  {
    name: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "starter", label: "Starter" },
      { value: "growth", label: "Growth" },
      { value: "enterprise", label: "Enterprise" },
      { value: "enterprise_plus", label: "Enterprise Plus" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "suspended", label: "Suspended" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "maxUsers", label: "Max Users", type: "number" },
  { name: "maxStorage", label: "Max Storage (MB)", type: "number" },
  {
    name: "billingCycle",
    label: "Billing Cycle",
    type: "select",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
    ],
  },
  {
    name: "amountPerCycle",
    label: "Amount Per Cycle (smallest unit)",
    type: "number",
  },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "QAR", label: "QAR" },
      { value: "AED", label: "AED" },
      { value: "SAR", label: "SAR" },
      { value: "INR", label: "INR" },
      { value: "USD", label: "USD" },
    ],
  },
  { name: "startsAt", label: "Starts At", type: "date", required: true },
  { name: "expiresAt", label: "Expires At", type: "date" },
];

export default async function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/licenses");

  const [license] = await db
    .select()
    .from(adminLicenses)
    .where(
      and(
        eq(adminLicenses.id, id),
        eq(adminLicenses.tenantId, session.tenantId),
        isNull(adminLicenses.deletedAt)
      )
    )
    .limit(1);

  if (!license) notFound();

  const initialData: Record<string, unknown> = {
    licenseKey: license.licenseKey,
    licenseName: license.licenseName,
    description: license.description ?? "",
    licenseType: license.licenseType,
    plan: license.plan,
    status: license.status,
    maxUsers: license.maxUsers,
    maxStorage: license.maxStorage,
    billingCycle: license.billingCycle,
    amountPerCycle: license.amountPerCycle,
    currency: license.currency,
    startsAt: license.startsAt.toISOString().slice(0, 10),
    expiresAt: license.expiresAt
      ? license.expiresAt.toISOString().slice(0, 10)
      : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/licenses/${license.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit License</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="License"
          apiPath={`/api/v1/admin-portal/licenses/${license.id}`}
          fields={LICENSE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/admin-portal/licenses/${license.id}`}
        />
      </div>
    </div>
  );
}
