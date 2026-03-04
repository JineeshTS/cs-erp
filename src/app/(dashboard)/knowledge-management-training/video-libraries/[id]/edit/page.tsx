import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVideoLibrary } from "@/lib/knowledge-management-training/service";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const VIDEO_LIBRARY_FIELDS: FieldConfig[] = [
  {
    name: "videoType",
    label: "Video Type",
    type: "select",
    required: true,
    options: [
      { value: "tutorial", label: "Tutorial" },
      { value: "safety_briefing", label: "Safety Briefing" },
      { value: "process_demo", label: "Process Demo" },
      { value: "webinar_recording", label: "Webinar Recording" },
      { value: "compliance_training", label: "Compliance Training" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "department", label: "Department", type: "text" },
  { name: "durationMinutes", label: "Duration (Minutes)", type: "number" },
  { name: "videoUrl", label: "Video URL", type: "text" },
  { name: "thumbnailUrl", label: "Thumbnail URL", type: "text" },
  { name: "language", label: "Language", type: "text" },
  { name: "viewCount", label: "View Count", type: "number" },
  { name: "isMandatory", label: "Mandatory", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVideoLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:edit")))
    redirect("/knowledge-management-training/video-libraries");

  const { id } = await params;

  const record = await getVideoLibrary(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/knowledge-management-training/video-libraries/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Video
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Video"
          apiPath={`/api/v1/knowledge-management-training/video-libraries/${id}`}
          fields={VIDEO_LIBRARY_FIELDS}
          initialData={{
            videoType: record.videoType,
            title: record.title ?? "",
            description: record.description ?? "",
            department: record.department ?? "",
            durationMinutes: record.durationMinutes ?? "",
            videoUrl: record.videoUrl ?? "",
            thumbnailUrl: record.thumbnailUrl ?? "",
            language: record.language ?? "",
            viewCount: record.viewCount ?? "",
            isMandatory: record.isMandatory ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/knowledge-management-training/video-libraries/${id}`}
        />
      </div>
    </div>
  );
}
