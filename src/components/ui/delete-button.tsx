"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { getCsrfToken } from "@/lib/client/csrf";

interface DeleteButtonProps {
  apiPath: string;
  redirectPath?: string;
  label?: string;
  confirmMessage?: string;
  className?: string;
}

/**
 * CSERP-008: Client-side delete button with CSRF header.
 * Replaces HTML <form method="POST"> patterns that can't send custom headers.
 */
export function DeleteButton({
  apiPath,
  redirectPath,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this record? This action cannot be undone.",
  className,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch(apiPath, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error?.message ?? `Delete failed (${res.status})`);
        return;
      }

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.back();
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={className ?? "inline-flex items-center gap-1.5 rounded-md border border-red-200 dark:border-red-800 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
