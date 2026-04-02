"use client";

import { useRouter } from "next/navigation";
import { Bot, User, FileText, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AgentAction {
  action: string;
  entity?: string;
  page?: string;
  formData?: Record<string, unknown>;
  filters?: Record<string, unknown>;
}

interface ChatMessageProps {
  role: string;
  content: string;
  fileAttachments?: FileAttachment[] | null;
  agentAction?: AgentAction | null;
  createdAt: string;
}

function ActionCard({ action }: { action: AgentAction }) {
  const router = useRouter();

  function handleGoToForm() {
    if (action.formData) {
      sessionStorage.setItem("ai-prefill", JSON.stringify(action.formData));
    }
    if (action.page) {
      router.push(action.page);
    }
  }

  function handleNavigate() {
    if (action.page) {
      router.push(action.page);
    }
  }

  if (action.action === "fill_form") {
    const entityLabel = action.entity
      ? action.entity.charAt(0).toUpperCase() + action.entity.slice(1)
      : "Record";

    return (
      <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <p className="mb-2 text-sm font-medium text-blue-900">
          Prepared: New {entityLabel} Form
        </p>
        {action.formData && (
          <div className="mb-2 space-y-1">
            {Object.entries(action.formData)
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs text-blue-700">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            {Object.keys(action.formData).length > 5 && (
              <p className="text-xs text-blue-500">
                +{Object.keys(action.formData).length - 5} more fields
              </p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleGoToForm}>
            <Eye className="me-1 h-3 w-3" />
            Go to form
          </Button>
        </div>
      </div>
    );
  }

  if (action.action === "navigate") {
    return (
      <div className="mt-2">
        <Button size="sm" variant="outline" onClick={handleNavigate}>
          <ExternalLink className="me-1 h-3 w-3" />
          Go to page
        </Button>
      </div>
    );
  }

  return null;
}

export function ChatMessage({
  role,
  content,
  fileAttachments,
  agentAction,
}: ChatMessageProps) {
  const isUser = role === "user";
  const parsedFiles = fileAttachments as FileAttachment[] | null;
  const parsedAction = agentAction as AgentAction | null;

  return (
    <div
      className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-gray-600" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2",
          isUser ? "bg-blue-600 text-white" : "border bg-white text-gray-800"
        )}
      >
        {parsedFiles && parsedFiles.length > 0 && (
          <div className="mb-1.5 space-y-1">
            {parsedFiles.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isUser ? "text-blue-100" : "text-gray-500"
                )}
              >
                <FileText className="h-3 w-3" />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap text-sm">{content}</div>

        {parsedAction && <ActionCard action={parsedAction} />}
      </div>
    </div>
  );
}
