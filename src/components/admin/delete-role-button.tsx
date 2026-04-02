"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getCsrfToken } from "@/lib/client/csrf";

interface DeleteRoleButtonProps {
  roleId: string;
  roleName: string;
  hasUsers: boolean;
}

export function DeleteRoleButton({ roleId, roleName, hasUsers }: DeleteRoleButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/roles/${roleId}`, {
        credentials: "include",
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to delete");
        setDeleting(false);
        return;
      }
      router.push("/admin/roles");
    } catch {
      setError("Network error");
      setDeleting(false);
    }
  }

  if (hasUsers) {
    return (
      <button
        type="button"
        disabled
        title="Cannot delete — users are assigned to this role"
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <span className="text-xs text-gray-500">Delete &quot;{roleName}&quot;?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}
