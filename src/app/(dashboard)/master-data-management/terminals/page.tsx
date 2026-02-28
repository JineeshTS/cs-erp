import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { terminals, ports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TerminalsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(session.id, session.tenantId, "masterdata:create");

  const data = await db
    .select({
      id: terminals.id,
      name: terminals.name,
      code: terminals.code,
      terminalType: terminals.terminalType,
      status: terminals.status,
      operatorName: terminals.operatorName,
      capacity: terminals.capacity,
      portName: ports.name,
      portId: terminals.portId,
      createdAt: terminals.createdAt,
    })
    .from(terminals)
    .leftJoin(ports, eq(terminals.portId, ports.id))
    .where(and(eq(terminals.tenantId, session.tenantId), isNull(terminals.deletedAt)))
    .orderBy(desc(terminals.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terminals</h1>
          <p className="text-sm text-gray-500">Manage port terminal facilities</p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/terminals/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Terminal
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No terminals found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/terminals/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first terminal
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((terminal) => (
                <tr key={terminal.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/master-data-management/terminals/${terminal.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {terminal.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{terminal.code || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{terminal.portName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{terminal.terminalType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={terminal.status === "active" ? "success" : "secondary"}>
                      {terminal.status}
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
