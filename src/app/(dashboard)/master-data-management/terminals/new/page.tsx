import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ports } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";

export default async function NewTerminalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:create")))
    redirect("/master-data-management/terminals");

  const portList = await db
    .select({ id: ports.id, name: ports.name })
    .from(ports)
    .where(and(eq(ports.tenantId, session.tenantId), isNull(ports.deletedAt)));

  const TERMINAL_FIELDS = [
    { name: "portId", label: "Port", type: "select" as const, required: true, options: portList.map(p => ({ value: p.id, label: p.name })) },
    { name: "name", label: "Terminal Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, placeholder: "e.g. T1" },
    { name: "operatorName", label: "Operator", type: "text" as const },
    { name: "capacity", label: "Capacity (TEU)", type: "number" as const },
    { name: "terminalType", label: "Terminal Type", type: "select" as const, options: [
      { value: "container", label: "Container" },
      { value: "bulk", label: "Bulk" },
      { value: "tanker", label: "Tanker" },
      { value: "multipurpose", label: "Multipurpose" },
      { value: "ro_ro", label: "Ro-Ro" },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master-data-management/terminals" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Terminal</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Terminal"
          apiPath="/api/v1/master-data-management/terminals"
          fields={TERMINAL_FIELDS}
          returnPath="/master-data-management/terminals"
        />
      </div>
    </div>
  );
}
