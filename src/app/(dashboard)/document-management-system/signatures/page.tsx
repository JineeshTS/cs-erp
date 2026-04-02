import Link from "next/link";
import { ArrowLeft, FileSignature } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
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

export default async function SignaturesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const data = await db
    .select()
    .from(dmsDocumentSignatures)
    .where(
      and(
        eq(dmsDocumentSignatures.tenantId, session.tenantId),
        isNull(dmsDocumentSignatures.deletedAt)
      )
    )
    .orderBy(desc(dmsDocumentSignatures.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/document-management-system"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signatures</h1>
            <p className="text-sm text-gray-500">
              Digital signatures and e-stamps for documents
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileSignature className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No signatures found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Signer Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Signer Email
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Signature Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Signed At
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((sig) => (
                <tr
                  key={sig.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/signatures/${sig.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {sig.signerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sig.signerEmail || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sig.signatureType}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(sig.status)}>
                      {sig.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sig.signedAt
                      ? sig.signedAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sig.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
