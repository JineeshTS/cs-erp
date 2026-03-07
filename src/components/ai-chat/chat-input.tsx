"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreview {
  file: File;
  name: string;
  type: string;
  size: number;
}

interface ChatInputProps {
  onSend: (message: string, files?: FilePreview[]) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 120; // ~5 rows
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;
    if (disabled) return;
    onSend(trimmed, files.length > 0 ? files : undefined);
    setMessage("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: FilePreview[] = Array.from(selected).map((f) => ({
      file: f,
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="border-t bg-white p-3">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-md border bg-gray-50 px-2 py-1 text-xs"
            >
              {f.type.startsWith("image/") ? (
                <ImageIcon className="h-3 w-3 text-blue-500" />
              ) : (
                <FileText className="h-3 w-3 text-gray-500" />
              )}
              <span className="max-w-[120px] truncate">{f.name}</span>
              <span className="text-gray-400">{formatFileSize(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ms-0.5 rounded-full p-0.5 hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="mb-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.xlsx,.xls,.csv,.docx,.png,.jpg,.jpeg,.webp"
          onChange={handleFileSelect}
          multiple
        />

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && files.length === 0)}
          className="mb-0.5 h-8 w-8 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
