import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { terminals, ports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TerminalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:read")))
    redirect("/master-data-management");

  const { id } = await params;

  const [terminal] = await db
    .select()
    .from(terminals)
    .where(and(eq(terminals.id, id), eq(terminals.tenantId, session.tenantId), isNull(terminals.deletedAt)))
    .limit(1);

  if (!terminal) notFound();

  const [port] = terminal.portId
    ? await db.select().from(ports).where(eq(ports.id, terminal.portId)).limit(1)
    : [null];

  const canEdit = await hasPermission(session.id, session.tenantId, "masterdata:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master-data-management/terminals" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{terminal.name}</h1>
          <p className="text-sm text-gray-500">{terminal.code || "No code"} &middot; {terminal.terminalType}</p>
        </div>
        {canEdit && (
          <Link
            href={`/master-data-management/terminals/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{terminal.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Code</dt>
            <dd className="mt-1 text-gray-900">{terminal.code || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port</dt>
            <dd className="mt-1 text-gray-900">
              {port ? (
                <Link href={`/master-data-management/ports/${port.id}`} className="text-blue-600 hover:underline">
                  {port.name}
                </Link>
              ) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-gray-900">{terminal.terminalType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operator</dt>
            <dd className="mt-1 text-gray-900">{terminal.operatorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Capacity</dt>
            <dd className="mt-1 text-gray-900">{terminal.capacity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={terminal.status === "active" ? "success" : "secondary"}>
                {terminal.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
