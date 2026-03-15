"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, PanelRightClose, PanelRightOpen, Loader2 } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SessionList } from "./session-list";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: string;
  content: string;
  fileAttachments: unknown;
  agentAction: unknown;
  createdAt: string;
}

interface FilePreview {
  file: File;
  name: string;
  type: string;
  size: number;
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export function ChatPanel() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai-chat-collapsed") === "true";
    }
    return false;
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    localStorage.setItem("ai-chat-collapsed", String(collapsed));
  }, [collapsed]);

  const loadMessages = useCallback(async (sid: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/ai-chat/sessions/${sid}/messages?limit=50`
      );
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data ?? []);
      } else {
        setError("Failed to load messages. Try refreshing.");
      }
    } catch {
      setError("Connection error. Check your network.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function createSession(): Promise<string | null> {
    try {
      const res = await fetch("/api/v1/ai-chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.id ?? null;
      }
      setError("Failed to create chat session.");
    } catch {
      setError("Connection error. Check your network.");
    }
    return null;
  }

  async function uploadFile(file: File): Promise<UploadedFile | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/ai-chat/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      setError(`Failed to upload ${file.name}.`);
    } catch {
      setError(`Upload error for ${file.name}.`);
    }
    return null;
  }

  async function handleSend(message: string, files?: FilePreview[]) {
    if (sending) return;

    let sid = sessionId;
    if (!sid) {
      sid = await createSession();
      if (!sid) return;
      setSessionId(sid);
    }

    // Upload files first
    let uploadedFiles: UploadedFile[] | undefined;
    if (files && files.length > 0) {
      const uploaded = await Promise.all(
        files.map((f) => uploadFile(f.file))
      );
      uploadedFiles = uploaded.filter(Boolean) as UploadedFile[];
    }

    // Optimistic: add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      fileAttachments: uploadedFiles ?? null,
      agentAction: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setSending(true);

    try {
      const res = await fetch(
        `/api/v1/ai-chat/sessions/${sid}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: message,
            files: uploadedFiles,
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const assistantMsg: Message = {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: json.data?.content ?? "",
          fileAttachments: null,
          agentAction: json.data?.agentAction ?? null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        fileAttachments: null,
        agentAction: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  }

  function handleSelectSession(sid: string) {
    setSessionId(sid);
    loadMessages(sid);
  }

  function handleNewSession() {
    setSessionId(null);
    setMessages([]);
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed end-0 top-16 z-40 rounded-s-lg border border-e-0 bg-white p-2 shadow-md hover:bg-gray-50"
        title="Open AI Assistant"
      >
        <PanelRightOpen className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-s bg-gray-50 lg:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-800">AI Assistant</h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Collapse panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Session selector */}
      <div className="border-b bg-white px-3 py-1.5">
        <SessionList
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
          <button type="button" onClick={() => setError(null)} className="ms-2 font-medium underline">Dismiss</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              AI Assistant
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Ask me anything about your ERP, CRM records, or shipping
              operations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                fileAttachments={
                  msg.fileAttachments as
                    | { name: string; url: string; type: string; size: number }[]
                    | null
                }
                agentAction={
                  msg.agentAction as {
                    action: string;
                    entity?: string;
                    page?: string;
                    formData?: Record<string, unknown>;
                    filters?: Record<string, unknown>;
                  } | null
                }
                createdAt={msg.createdAt}
              />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
