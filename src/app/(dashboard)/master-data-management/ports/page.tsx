import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { ports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function PortsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "masterdata:create"
  );

  const data = await db
    .select()
    .from(ports)
    .where(
      and(eq(ports.tenantId, session.tenantId), isNull(ports.deletedAt))
    )
    .orderBy(desc(ports.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ports & Terminals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage port and terminal master data
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/ports/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add Port
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white px-8 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Plus className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 font-medium text-slate-900">No ports found</p>
          <p className="mt-1 text-sm text-slate-500">Get started by adding your first port.</p>
          {canCreate && (
            <Link
              href="/master-data-management/ports/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Add Port
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                  UN/LOCODE
                </th>
                <th className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Country
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
              {data.map((port) => (
                <tr
                  key={port.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/master-data-management/ports/${port.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600"
                    >
                      {port.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{port.unLocode}</td>
                  <td className="px-5 py-3.5 text-slate-600">{port.country}</td>
                  <td className="px-5 py-3.5 text-slate-600">{port.portType}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        port.status === "active" ? "success" : "secondary"
                      }
                    >
                      {port.status}
                    </Badge>
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
