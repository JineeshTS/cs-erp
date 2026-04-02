"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

interface FileUploadProps {
  /** Accepted MIME types (e.g., ".csv,.xlsx" or "image/*") */
  accept?: string;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Allow multiple files */
  multiple?: boolean;
  /** Callback with selected files */
  onFiles: (files: File[]) => void;
  /** Currently selected files (controlled mode) */
  files?: File[];
  /** Whether upload is in progress */
  uploading?: boolean;
  /** Upload progress (0-100) */
  progress?: number;
  /** Disable the upload */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  return FileText;
}

/**
 * FileUpload — drag-and-drop file upload with preview.
 * Used for: document management, import wizard, damage photos, EDI files.
 */
export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  onFiles,
  files = [],
  uploading = false,
  progress,
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): File[] => {
      const valid: File[] = [];
      for (const file of Array.from(fileList)) {
        if (file.size > maxSize) {
          setError(`${file.name} exceeds max size (${formatSize(maxSize)})`);
          continue;
        }
        valid.push(file);
      }
      return multiple ? valid : valid.slice(0, 1);
    },
    [maxSize, multiple]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    setError(null);
    const validated = validateFiles(e.dataTransfer.files);
    if (validated.length > 0) onFiles(validated);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setError(null);
    const validated = validateFiles(e.target.files);
    if (validated.length > 0) onFiles(validated);
    e.target.value = "";
  }

  function removeFile(index: number) {
    onFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
            : "border-slate-300 hover:border-slate-400 dark:border-gray-600 dark:hover:border-gray-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        ) : (
          <Upload className="h-8 w-8 text-slate-400 dark:text-gray-500" />
        )}
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
          {uploading ? "Uploading..." : "Drop files here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
          Max {formatSize(maxSize)}{accept ? ` · ${accept}` : ""}
        </p>
      </div>

      {/* Progress bar */}
      {uploading && progress != null && (
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.type);
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-gray-700"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="flex-1 truncate text-slate-700 dark:text-gray-300">{file.name}</span>
                <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-gray-800"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
