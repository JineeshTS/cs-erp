"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UserEditFormProps {
  userId: string;
  currentRoleId: string;
  currentStatus: string;
  roles: Array<{ id: string; name: string }>;
  isSelf: boolean;
}

export function UserEditForm({
  userId,
  currentRoleId,
  currentStatus,
  roles,
  isSelf,
}: UserEditFormProps) {
  const router = useRouter();
  const [roleId, setRoleId] = useState(currentRoleId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveRole() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to update");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to deactivate");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">No role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSaveRole} disabled={saving || roleId === currentRoleId}>
            {saving ? "Saving..." : "Update Role"}
          </Button>

          {!isSelf && currentStatus !== "inactive" && (
            <Button variant="destructive" onClick={handleDeactivate} disabled={saving}>
              Deactivate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
