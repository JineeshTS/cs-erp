import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getReturnIncentive } from "@/lib/empty-container-repositioning-ai/service";

export default async function ReturnIncentiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const record = await getReturnIncentive(id, session.tenantId);
  if (!record) notFound();

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Incentive Ref", value: record.incentiveRef },
    { label: "Title", value: record.title },
    {
      label: "Incentive Type",
      value: record.incentiveType.replace(/_/g, " "),
    },
    { label: "Customer Name", value: record.customerName },
    { label: "Trade Lane", value: record.tradeLane },
    { label: "Container Type", value: record.containerType },
    { label: "Target Location", value: record.targetLocation },
    { label: "Incentive Value", value: record.incentiveValue },
    { label: "Currency", value: record.currency },
    {
      label: "Valid From",
      value: record.validFrom
        ? new Date(record.validFrom).toLocaleString()
        : "—",
    },
    {
      label: "Valid To",
      value: record.validTo
        ? new Date(record.validTo).toLocaleString()
        : "—",
    },
    { label: "Utilization Count", value: record.utilizationCount },
    { label: "Is Active", value: record.isActive ? "Yes" : "No" },
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
            href="/empty-container-repositioning-ai/return-incentives"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {record.title}
            </h1>
            <p className="text-muted-foreground">{record.incentiveRef}</p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/return-incentives/${id}/edit`}
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
