import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfApiKeys } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "revoked":
      return "destructive" as const;
    case "expired":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function ApiKeyDetailPage({
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
    .from(isfApiKeys)
    .where(
      and(
        eq(isfApiKeys.id, id),
        eq(isfApiKeys.tenantId, session.tenantId),
        isNull(isfApiKeys.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/api-keys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.keyName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.keyPrefix}... &middot; API Key
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Key Name</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.keyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Key Prefix</p>
            <p className="mt-0.5 font-mono text-sm text-gray-900">
              {record.keyPrefix}...
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Rate Limit</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.rateLimit ? `${record.rateLimit}/min` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expires At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.expiresAt ? fmtDate(record.expiresAt) : "Never"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Used At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.lastUsedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Revoked At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.revokedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Revoke Reason</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.revokeReason ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
        </div>
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
