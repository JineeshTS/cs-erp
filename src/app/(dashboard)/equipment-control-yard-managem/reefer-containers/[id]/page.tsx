import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyReeferContainers } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function ReeferContainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem/reefer-containers");

  const { id } = await params;

  const record = await db
    .select()
    .from(eqyReeferContainers)
    .where(
      and(
        eq(eqyReeferContainers.id, id),
        eq(eqyReeferContainers.tenantId, session.tenantId),
        isNull(eqyReeferContainers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:delete"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "active":
        return "success" as const;
      case "standby":
        return "secondary" as const;
      case "under_repair":
        return "destructive" as const;
      case "off":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/reefer-containers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.containerNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Reefer Container &mdash; {record.reeferUnitModel ?? "Unknown Model"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/equipment-control-yard-managem/reefer-containers/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/equipment-control-yard-managem/reefer-containers/${id}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Container Number", value: record.containerNumber },
            {
              label: "Reefer Unit Model",
              value: record.reeferUnitModel ?? "-",
            },
            {
              label: "Reefer Unit Serial",
              value: record.reeferUnitSerial ?? "-",
            },
            {
              label: "Set Temperature",
              value: record.setTemperature
                ? `${Number(record.setTemperature)}°C`
                : "-",
            },
            {
              label: "Min Temperature",
              value: record.minTemperature
                ? `${Number(record.minTemperature)}°C`
                : "-",
            },
            {
              label: "Max Temperature",
              value: record.maxTemperature
                ? `${Number(record.maxTemperature)}°C`
                : "-",
            },
            {
              label: "Humidity",
              value: record.humidity ? `${Number(record.humidity)}%` : "-",
            },
            { label: "Ventilation", value: record.ventilation ?? "-" },
            {
              label: "Atmosphere",
              value: (record.atmosphere ?? "normal").replace(/_/g, " "),
            },
            { label: "Last PTI Date", value: fmtDate(record.lastPtiDate) },
            { label: "Next PTI Due", value: fmtDate(record.nextPtiDue) },
            {
              label: "Power Status",
              value: (record.powerStatus ?? "off").replace(/_/g, " "),
            },
            {
              label: "Current Temperature",
              value: record.currentTemperature
                ? `${Number(record.currentTemperature)}°C`
                : "-",
            },
            { label: "Fuel Type", value: record.fuelType ?? "-" },
            {
              label: "Genset Required",
              value: record.gensetRequired ? "Yes" : "No",
            },
            {
              label: "Status",
              value: (
                <Badge variant={statusVariant(record.status)}>
                  {record.status.replace(/_/g, " ")}
                </Badge>
              ),
            },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <div className="mt-0.5 text-sm text-gray-900">{field.value}</div>
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
