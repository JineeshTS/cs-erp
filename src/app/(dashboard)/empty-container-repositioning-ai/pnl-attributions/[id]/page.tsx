import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getPnlAttribution } from "@/lib/empty-container-repositioning-ai/service";

export default async function PnlAttributionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const record = await getPnlAttribution(id, session.tenantId);
  if (!record) notFound();

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Attribution Ref", value: record.attributionRef },
    { label: "Title", value: record.title },
    {
      label: "Attribution Type",
      value: record.attributionType.replace(/_/g, " "),
    },
    {
      label: "Period From",
      value: record.periodFrom
        ? new Date(record.periodFrom).toLocaleString()
        : "—",
    },
    {
      label: "Period To",
      value: record.periodTo
        ? new Date(record.periodTo).toLocaleString()
        : "—",
    },
    { label: "Trade Lane", value: record.tradeLane },
    { label: "Repositioning Revenue", value: record.repositioningRevenue },
    { label: "Repositioning Cost", value: record.repositioningCost },
    { label: "Net P&L", value: record.netPnl },
    { label: "Total Moves", value: record.totalMoves },
    { label: "Cost Per Move", value: record.costPerMove },
    { label: "Revenue Per Move", value: record.revenuePerMove },
    { label: "Notes", value: record.notes || "—" },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            record.status === "active"
              ? "default"
              : record.status === "draft"
                ? "secondary"
                : "outline"
          }
        >
          {record.status}
        </Badge>
      ),
    },
    {
      label: "Created At",
      value: new Date(record.createdAt).toLocaleString(),
    },
    {
      label: "Updated At",
      value: new Date(record.updatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/empty-container-repositioning-ai/pnl-attributions"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {record.title}
            </h1>
            <p className="text-muted-foreground">{record.attributionRef}</p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/pnl-attributions/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-md border">
        <dl className="divide-y">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-3 gap-4 px-4 py-3"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className="col-span-2 text-sm">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
