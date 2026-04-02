"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string | null;
  createdAt: string;
}

interface SessionListProps {
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function SessionList({
  currentSessionId,
  onSelectSession,
  onNewSession,
}: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [open, setOpen] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ai-chat/sessions?limit=10", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data ?? []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const currentTitle =
    sessions.find((s) => s.id === currentSessionId)?.title ?? "New Chat";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="flex-1 truncate text-start">{currentTitle}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute start-0 top-full z-50 mt-1 w-full rounded-md border bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onNewSession();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </button>

          {sessions.length > 0 && (
            <div className="my-1 border-t" />
          )}

          <div className="max-h-48 overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectSession(s.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-start text-sm hover:bg-gray-50",
                  s.id === currentSessionId && "bg-gray-100 font-medium"
                )}
              >
                <span className="truncate">
                  {s.title || "Untitled"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
