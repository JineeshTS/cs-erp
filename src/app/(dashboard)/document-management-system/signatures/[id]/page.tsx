import Link from "next/link";
import { ArrowLeft, FileSignature } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsDocumentSignatures } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "warning" as const;
    case "signed":
      return "success" as const;
    case "rejected":
      return "destructive" as const;
    case "revoked":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

function formatTimestamp(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SignatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const signature = await db
    .select()
    .from(dmsDocumentSignatures)
    .where(
      and(
        eq(dmsDocumentSignatures.id, id),
        eq(dmsDocumentSignatures.tenantId, session.tenantId),
        isNull(dmsDocumentSignatures.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!signature) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/signatures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {signature.signerName}
          </h1>
          <p className="text-sm text-gray-500">Signature details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.documentId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.versionId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Signer ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.signerId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Signer Name</dt>
            <dd className="mt-1 text-gray-900">{signature.signerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Signer Email</dt>
            <dd className="mt-1 text-gray-900">
              {signature.signerEmail || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Signature Type
            </dt>
            <dd className="mt-1 text-gray-900">{signature.signatureType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(signature.status)}>
                {signature.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.ipAddress || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Serial
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {signature.certificateSerial || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stamp Type</dt>
            <dd className="mt-1 text-gray-900">
              {signature.stampType || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {signature.reason || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Signature Data
            </dt>
            <dd className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
              {signature.signatureData || "-"}
            </dd>
          </div>
          {signature.stampData != null ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Stamp Data</dt>
              <dd className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
                {JSON.stringify(signature.stampData, null, 2)}
              </dd>
            </div>
          ) : null}
          {signature.metadata != null ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
                {JSON.stringify(signature.metadata, null, 2)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Timestamps
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(signature.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(signature.updatedAt)}
            </dd>
          </div>
          {signature.signedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Signed At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(signature.signedAt)}
              </dd>
            </div>
          )}
          {signature.expiresAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Expires At
              </dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(signature.expiresAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
