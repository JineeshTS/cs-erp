import { redirect } from "next/navigation";

export default async function EditOrchestrationTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/ai-agent-framework/orchestration-tasks/${id}`);
}
