import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listDdmPredictions } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "success",
  resolved: "secondary",
  expired: "warning",
  false_alarm: "destructive",
};

export default async function PredictionsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { search, status, cursor } = await searchParams;

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:create"
  );

  const { data, meta } = await listDdmPredictions({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            D&D Predictions
          </h1>
          <p className="text-sm text-gray-500">
            AI-powered demurrage and detention predictions
          </p>
        </div>
        {canCreate && (
          <Link
            href="/demurrage-detention-management/predictions/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Prediction
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No predictions found.</p>
          {canCreate && (
            <Link
              href="/demurrage-detention-management/predictions/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first prediction
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Prediction Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Prediction Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Risk Level
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Predicted Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((prediction) => (
                <tr
                  key={prediction.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demurrage-detention-management/predictions/${prediction.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {prediction.predictionRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {prediction.containerNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {prediction.predictionType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {prediction.riskLevel}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {prediction.currency} {prediction.predictedAmount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[prediction.status] ?? "secondary"}>
                      {prediction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && meta.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/demurrage-detention-management/predictions?cursor=${encodeURIComponent(meta.cursor)}${status ? `&status=${encodeURIComponent(status)}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
