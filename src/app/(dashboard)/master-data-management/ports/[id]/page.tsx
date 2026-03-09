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
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
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
    "masterdata:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/ports"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{port.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            <span className="font-mono text-xs">{port.unLocode}</span> &middot; {port.country}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/master-data-management/ports/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Port Details</h3>
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">UN/LOCODE</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{port.unLocode}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Country</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {port.countryName || port.country}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Port Type</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{port.portType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Status</dt>
            <dd className="mt-1.5">
              <Badge
                variant={port.status === "active" ? "success" : "secondary"}
              >
                {port.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Timezone</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{port.timezone || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Major Port</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {port.isMajorPort ? "Yes" : "No"}
            </dd>
          </div>
          {port.latitude && port.longitude && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Coordinates
              </dt>
              <dd className="mt-1 font-mono text-sm text-slate-900">
                {port.latitude}, {port.longitude}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {portTerminals.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Terminals <span className="text-sm font-normal text-slate-400">({portTerminals.length})</span>
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Code
                  </th>
                  <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portTerminals.map((t) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {t.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                      {t.code || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {t.terminalType}
                    </td>
                    <td className="px-5 py-3.5">
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
