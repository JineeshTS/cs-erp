import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSegregationRule } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function SegregationRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const rule = await getSegregationRule(id, session.tenantId);
  if (!rule) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/segregation-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {rule.ruleRef}
          </h1>
          <p className="text-sm text-gray-500">
            Segregation Rule &middot; {rule.ruleName || "Unnamed"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/dangerous-goods-management/segregation-rules/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Rule Ref</dt>
            <dd className="mt-1 text-gray-900">{rule.ruleRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Name</dt>
            <dd className="mt-1 text-gray-900">{rule.ruleName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rule Type</dt>
            <dd className="mt-1 text-gray-900">
              {rule.ruleType ? rule.ruleType.replace(/_/g, " ") : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source Class</dt>
            <dd className="mt-1 text-gray-900">{rule.sourceClass || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Class</dt>
            <dd className="mt-1 text-gray-900">{rule.targetClass || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Segregation Level</dt>
            <dd className="mt-1 text-gray-900">
              {rule.segregationLevel
                ? rule.segregationLevel.replace(/_/g, " ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stowage Position</dt>
            <dd className="mt-1 text-gray-900">
              {rule.stowagePosition
                ? rule.stowagePosition.replace(/_/g, " ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stowage Category</dt>
            <dd className="mt-1 text-gray-900">{rule.stowageCategory || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">On Deck</dt>
            <dd className="mt-1 text-gray-900">{rule.onDeck ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Under Deck</dt>
            <dd className="mt-1 text-gray-900">{rule.underDeck ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Minimum Distance</dt>
            <dd className="mt-1 text-gray-900">{rule.minimumDistance || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Distance Unit</dt>
            <dd className="mt-1 text-gray-900">{rule.distanceUnit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closed vs Closed</dt>
            <dd className="mt-1 text-gray-900">{rule.closedVsClosed || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closed vs Open</dt>
            <dd className="mt-1 text-gray-900">{rule.closedVsOpen || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Open vs Open</dt>
            <dd className="mt-1 text-gray-900">{rule.openVsOpen || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Reference</dt>
            <dd className="mt-1 text-gray-900">{rule.imdgReference || "-"}</dd>
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
            <dd className="mt-1 text-gray-900">
              {rule.priority !== null && rule.priority !== undefined
                ? rule.priority
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  rule.status === "active"
                    ? "success"
                    : rule.status === "draft"
                      ? "secondary"
                      : "default"
                }
              >
                {rule.status}
              </Badge>
            </dd>
          </div>
          {rule.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {rule.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
