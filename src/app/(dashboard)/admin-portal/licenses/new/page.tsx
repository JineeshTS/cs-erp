import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewLicensePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "admin:create"))
  )
    redirect("/admin-portal/licenses");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/licenses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New License</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="License"
          apiPath="/api/v1/admin-portal/licenses"
          fields={LICENSE_FIELDS}
          returnPath="/admin-portal/licenses"
        />
      </div>
    </div>
  );
}
