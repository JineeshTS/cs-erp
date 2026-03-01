import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfServiceAccounts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function ServiceAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const { id } = await params;

  const record = await db
    .select()
    .from(isfServiceAccounts)
    .where(
      and(
        eq(isfServiceAccounts.id, id),
        eq(isfServiceAccounts.tenantId, session.tenantId),
        isNull(isfServiceAccounts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/service-accounts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.accountName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.accountCode} &middot;{" "}
            {record.serviceType.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Account Name", value: record.accountName },
            { label: "Account Code", value: record.accountCode },
            {
              label: "Service Type",
              value: record.serviceType.replace(/_/g, " "),
            },
            { label: "Last Rotated", value: fmtDate(record.lastRotatedAt) },
            { label: "Expires At", value: fmtDate(record.expiresAt) },
            { label: "Last Used", value: fmtDate(record.lastUsedAt) },
            { label: "Created", value: fmtDate(record.createdAt) },
            { label: "Updated", value: fmtDate(record.updatedAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
        {record.description && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.description}
            </p>
          </div>
        )}
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
