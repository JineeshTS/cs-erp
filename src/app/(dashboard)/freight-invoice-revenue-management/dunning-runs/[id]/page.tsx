import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDunningRun } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "planned":
      return "secondary";
    case "running":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleString();
}

export default async function DunningRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const run = await getDunningRun(id, session.tenantId);
  if (!run) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Run Ref", value: run.runRef },
    { label: "Run Type", value: run.runType },
    { label: "Target Segment", value: run.targetSegment },
    { label: "Currency", value: run.currency },
    { label: "Total Outstanding", value: run.totalOutstanding },
    { label: "Invoices Targeted", value: run.invoicesTargeted },
    { label: "Customers Targeted", value: run.customersTargeted },
    { label: "Actions Generated", value: run.actionsGenerated },
    { label: "Actions Completed", value: run.actionsCompleted },
    { label: "Amount Collected", value: run.amountCollected },
    { label: "AI Model Version", value: run.aiModelVersion },
    {
      label: "Status",
      value: (
        <Badge variant={statusVariant(run.status)}>
          {run.status}
        </Badge>
      ),
    },
    { label: "Started At", value: fmtDate(run.startedAt) },
    { label: "Completed At", value: fmtDate(run.completedAt) },
    { label: "Notes", value: run.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/freight-invoice-revenue-management/dunning-runs"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {run.runRef}
            </h1>
            <p className="text-sm text-gray-500">Dunning Run Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/freight-invoice-revenue-management/dunning-runs/${run.id}/edit`}
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
