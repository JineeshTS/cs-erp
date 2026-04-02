import { redirect } from "next/navigation";

export default async function EditDocumentJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/ai-agent-framework/documents/${id}`);
}
