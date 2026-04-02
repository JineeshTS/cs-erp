"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface PdfDownloadButtonProps {
  apiPath: string;
  filename: string;
  label?: string;
  className?: string;
}

/**
 * Client-side PDF download button.
 * Fetches the PDF from the given API route, creates a blob, and triggers a browser download.
 */
export function PdfDownloadButton({
  apiPath,
  filename,
  label = "Download PDF",
  className,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(apiPath);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? `Download failed (${res.status})`);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
      }
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
