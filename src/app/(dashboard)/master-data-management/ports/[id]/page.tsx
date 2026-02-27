import Link from "next/link";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ports, terminals } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function PortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:read")))
    redirect("/master-data-management");

  const { id } = await params;

  const [port, portTerminals] = await Promise.all([
    db
      .select()
      .from(ports)
      .where(
        and(
          eq(ports.id, id),
          eq(ports.tenantId, session.tenantId),
          isNull(ports.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(terminals)
      .where(and(eq(terminals.portId, id), isNull(terminals.deletedAt))),
  ]);

  if (!port) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vessels:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/ports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{port.name}</h1>
          <p className="text-sm text-gray-500">
            {port.unLocode} &middot; {port.country}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/master-data-management/ports/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">UN/LOCODE</dt>
            <dd className="mt-1 text-gray-900">{port.unLocode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">
              {port.countryName || port.country}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Type</dt>
            <dd className="mt-1 text-gray-900">{port.portType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={port.status === "active" ? "success" : "secondary"}
              >
                {port.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Timezone</dt>
            <dd className="mt-1 text-gray-900">{port.timezone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Major Port</dt>
            <dd className="mt-1 text-gray-900">
              {port.isMajorPort ? "Yes" : "No"}
            </dd>
          </div>
          {port.latitude && port.longitude && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Coordinates
              </dt>
              <dd className="mt-1 text-gray-900">
                {port.latitude}, {port.longitude}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {portTerminals.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Terminals ({portTerminals.length})
          </h2>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Code
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {portTerminals.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.code || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.terminalType}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.status === "active" ? "success" : "secondary"
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
