import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFreeTimeRule } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "success",
  draft: "secondary",
  expired: "destructive",
};

export default async function FreeTimeRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const rule = await getFreeTimeRule(id, session.tenantId);
  if (!rule) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/free-time-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {rule.ruleRef}
          </h1>
          <p className="text-sm text-gray-500">
            Free Time Rule Details
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/free-time-rules/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Ref</dt>
            <dd className="mt-1 text-gray-900">{rule.ruleRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Name</dt>
            <dd className="mt-1 text-gray-900">{rule.ruleName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Type</dt>
            <dd className="mt-1 text-gray-900">{rule.ruleType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applicable To</dt>
            <dd className="mt-1 text-gray-900">{rule.applicableTo}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{rule.portName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Country</dt>
            <dd className="mt-1 text-gray-900">{rule.portCountry ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Size</dt>
            <dd className="mt-1 text-gray-900">{rule.containerSize ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{rule.containerType ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{rule.customerName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Free Time Days</dt>
            <dd className="mt-1 text-gray-900">{rule.freeTimeDays}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Grace Period Days</dt>
            <dd className="mt-1 text-gray-900">{rule.gracePeriodDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weekends Excluded</dt>
            <dd className="mt-1 text-gray-900">
              {rule.weekendsExcluded ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Holidays Excluded</dt>
            <dd className="mt-1 text-gray-900">
              {rule.holidaysExcluded ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective From</dt>
            <dd className="mt-1 text-gray-900">
              {rule.effectiveFrom
                ? new Date(rule.effectiveFrom).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {rule.effectiveTo
                ? new Date(rule.effectiveTo).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{rule.priority ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[rule.status] ?? "secondary"}>
                {rule.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{rule.notes ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
