import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoServiceCategories } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ServiceCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:read")))
    redirect("/");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoServiceCategories)
    .where(
      and(
        eq(csoServiceCategories.id, id),
        eq(csoServiceCategories.tenantId, session.tenantId),
        isNull(csoServiceCategories.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "customer_service:edit");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/service-categories" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.categoryName}</h1>
          <p className="text-sm text-gray-500">{record.categoryCode}</p>
        </div>
        {canEdit && (
          <Link
            href={`/customer-service-operations/service-categories/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      {/* Details */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Category Code", value: record.categoryCode },
            { label: "Category Name", value: record.categoryName },
            { label: "SLA Hours", value: record.slaHours?.toString() ?? "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Active</p>
            <div className="mt-0.5">
              <Badge variant={record.isActive ? "success" : "secondary"}>
                {record.isActive ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Sort Order</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.sortOrder?.toString() ?? "0"}</p>
          </div>
        </div>

        {record.description && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
