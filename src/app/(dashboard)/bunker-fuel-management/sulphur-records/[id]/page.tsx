import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSulphurRecord } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function SulphurRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/bunker-fuel-management");

  const { id } = await params;
  const record = await getSulphurRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Record Ref", value: record.recordRef },
    { label: "Vessel Name", value: record.vesselName },
    { label: "Vessel IMO", value: record.vesselImo },
    { label: "Port", value: record.port },
    { label: "Fuel Type", value: record.fuelType },
    { label: "Sulphur Content Actual", value: record.sulphurContentActual },
    { label: "Sulphur Limit", value: record.sulphurLimit },
    {
      label: "Is Compliant",
      value: (
        <Badge variant={record.isCompliant ? "success" : "destructive"}>
          {record.isCompliant ? "Yes" : "No"}
        </Badge>
      ),
    },
    { label: "ECA Zone", value: record.ecaZone },
    {
      label: "Scrubber Equipped",
      value: (
        <Badge variant={record.scrubberEquipped ? "success" : "secondary"}>
          {record.scrubberEquipped ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      label: "Scrubber Operational",
      value:
        record.scrubberOperational != null ? (
          <Badge
            variant={record.scrubberOperational ? "success" : "destructive"}
          >
            {record.scrubberOperational ? "Yes" : "No"}
          </Badge>
        ) : null,
    },
    {
      label: "Changeover Date",
      value: record.changoverDate
        ? new Date(record.changoverDate).toLocaleString()
        : null,
    },
    { label: "Changeover Port", value: record.changoverPort },
    { label: "Changeover From Fuel", value: record.changoverFromFuel },
    { label: "Changeover To Fuel", value: record.changoverToFuel },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            record.status === "verified"
              ? "success"
              : record.status === "non_compliant"
                ? "destructive"
                : "secondary"
          }
        >
          {record.status}
        </Badge>
      ),
    },
    { label: "Notes", value: record.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/bunker-fuel-management/sulphur-records"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.recordRef}
            </h1>
            <p className="text-sm text-gray-500">
              Low Sulphur Record Details
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/bunker-fuel-management/sulphur-records/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
