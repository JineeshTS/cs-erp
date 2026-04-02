import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ShieldCheck } from "lucide-react";
import { eq, and, isNull, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function DoaMatrixListPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "doa:read"
  );
  if (!canRead) redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "doa:create"
  );

  const entries = await db
    .select()
    .from(wneDoaMatrix)
    .where(
      and(
        eq(wneDoaMatrix.tenantId, session.tenantId),
        isNull(wneDoaMatrix.deletedAt)
      )
    )
    .orderBy(desc(wneDoaMatrix.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DOA Matrix</h1>
            <p className="text-sm text-gray-500">
              Configure delegation of authority limits
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/workflow-notification-engine/doa-matrix/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New DOA Entry
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        {entries.length === 0 ? (
          <div className="py-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No DOA entries
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first delegation of authority entry.
            </p>
            {canCreate && (
              <Link
                href="/workflow-notification-engine/doa-matrix/new"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New DOA Entry
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Entity Type</th>
                  <th className="pb-3 pr-4 font-medium">Action Type</th>
                  <th className="pb-3 pr-4 font-medium">Amount Range</th>
                  <th className="pb-3 pr-4 font-medium">Currency</th>
                  <th className="pb-3 pr-4 font-medium">Dual Approval</th>
                  <th className="pb-3 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/workflow-notification-engine/doa-matrix/${entry.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {entry.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 capitalize">{entry.entityType}</td>
                    <td className="py-3 pr-4 capitalize">{entry.actionType}</td>
                    <td className="py-3 pr-4">
                      {entry.minAmount != null || entry.maxAmount != null
                        ? `${entry.minAmount ?? 0} - ${entry.maxAmount ?? "∞"}`
                        : "-"}
                    </td>
                    <td className="py-3 pr-4">{entry.currency ?? "USD"}</td>
                    <td className="py-3 pr-4">
                      {entry.requiresDualApproval ? (
                        <Badge variant="warning">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {entry.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
