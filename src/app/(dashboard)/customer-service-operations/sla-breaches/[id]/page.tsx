import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoSlaBreaches } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function SLABreachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "customer_service:read"
    ))
  )
    redirect("/customer-service-operations");

  const { id } = await params;

  const record = await db
    .select()
    .from(csoSlaBreaches)
    .where(
      and(
        eq(csoSlaBreaches.id, id),
        eq(csoSlaBreaches.tenantId, session.tenantId),
        isNull(csoSlaBreaches.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customer_service:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "customer_service:delete"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/customer-service-operations/sla-breaches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            SLA Breach Detail
          </h1>
          <p className="text-sm text-gray-500">
            {record.entityType.replace(/_/g, " ")} &mdash;{" "}
            {record.breachType.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/customer-service-operations/sla-breaches/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/customer-service-operations/sla-breaches/${id}`} />
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Entity Type",
              value: record.entityType.replace(/_/g, " "),
            },
            {
              label: "Breach Type",
              value: record.breachType.replace(/_/g, " "),
            },
            { label: "Expected At", value: fmtDate(record.expectedAt) },
            { label: "Breached At", value: fmtDate(record.breachedAt) },
            {
              label: "Overage (minutes)",
              value: record.overageMinutes?.toString() ?? "-",
            },
            {
              label: "Acknowledged",
              value: record.acknowledged ? "Yes" : "No",
            },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {field.label === "Acknowledged" ? (
                  <Badge
                    variant={
                      field.value === "Yes" ? "success" : "destructive"
                    }
                  >
                    {field.value}
                  </Badge>
                ) : (
                  field.value
                )}
              </p>
            </div>
          ))}
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
