import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoKnowledgeArticles } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const ARTICLE_FIELDS: FieldConfig[] = [
  { name: "articleCode", label: "Article Code", type: "text", required: true },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "content", label: "Content", type: "textarea" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]},
  { name: "isPublic", label: "Public", type: "checkbox" },
];

export default async function EditKnowledgeArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/knowledge-articles");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoKnowledgeArticles)
    .where(
      and(
        eq(csoKnowledgeArticles.id, id),
        eq(csoKnowledgeArticles.tenantId, session.tenantId),
        isNull(csoKnowledgeArticles.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    articleCode: record.articleCode,
    title: record.title,
    content: record.content ?? "",
    summary: record.summary ?? "",
    status: record.status,
    isPublic: record.isPublic,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/knowledge-articles/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Article"
          apiPath={`/api/v1/customer-service-operations/knowledge-articles/${id}`}
          fields={ARTICLE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/knowledge-articles/${id}`}
        />
      </div>
    </div>
  );
}
