import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfEncryptionKeys } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "compromised":
    case "destroyed":
      return "destructive" as const;
    case "pending_rotation":
      return "warning" as const;
    case "inactive":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function EncryptionKeyDetailPage({
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
    .from(isfEncryptionKeys)
    .where(
      and(
        eq(isfEncryptionKeys.id, id),
        eq(isfEncryptionKeys.tenantId, session.tenantId),
        isNull(isfEncryptionKeys.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "infra:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/encryption-keys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.keyName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.keyCode} &middot; {record.keyType} &middot;{" "}
            {record.algorithm}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/infrastructure-security/encryption-keys/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Key Name</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.keyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Key Code</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.keyCode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Key Type</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.keyType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Algorithm</p>
            <p className="mt-0.5 font-mono text-sm text-gray-900">
              {record.algorithm}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Key Size</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.keySize} bits
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Purpose</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.purpose.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={statusVariant(record.status)}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Version</p>
            <p className="mt-0.5 text-sm text-gray-900">v{record.version}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Auto-Rotate Interval
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.autoRotateIntervalDays
                ? `${record.autoRotateIntervalDays} days`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Provider</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.provider ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Provider Key ID
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.providerKeyId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Rotated</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.lastRotatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Expires At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.expiresAt ? fmtDate(record.expiresAt) : "Never"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.updatedAt)}
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
