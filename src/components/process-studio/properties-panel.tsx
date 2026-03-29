"use client";

import { type Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PropertiesPanelProps {
  node: Node | null;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ node, onUpdate, onClose }: PropertiesPanelProps) {
  if (!node) return null;

  const data = node.data as Record<string, unknown>;

  function update(field: string, value: unknown) {
    onUpdate(node!.id, { ...data, [field]: value });
  }

  const isStartOrEnd = node.type === "start" || node.type === "end";

  return (
    <div className="w-72 shrink-0 border-s border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
          Properties
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Node Type</label>
          <div className="text-sm font-medium text-slate-700 dark:text-gray-300 capitalize">
            {(node.type || "").replace(/_/g, " ")}
          </div>
        </div>

        {!isStartOrEnd && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Label</label>
              <input
                type="text"
                value={(data.label as string) || ""}
                onChange={(e) => update("label", e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {(node.type === "user_task" || node.type === "approval_gate") && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Assignee Type</label>
                  <select
                    value={(data.assigneeType as string) || "role"}
                    onChange={(e) => update("assigneeType", e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="role">Role</option>
                    <option value="user">Specific User</option>
                    <option value="department">Department</option>
                    <option value="initiator">Initiator</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Assignee</label>
                  <input
                    type="text"
                    value={(data.assignee as string) || ""}
                    onChange={(e) => update("assignee", e.target.value)}
                    placeholder="e.g., operations_manager"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </>
            )}

            {node.type === "approval_gate" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Required Approvals</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={(data.requiredApprovals as number) || 1}
                  onChange={(e) => update("requiredApprovals", parseInt(e.target.value) || 1)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            )}

            {node.type === "service_task" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">API Endpoint</label>
                <input
                  type="text"
                  value={(data.apiEndpoint as string) || ""}
                  onChange={(e) => update("apiEndpoint", e.target.value)}
                  placeholder="/api/v1/..."
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            )}

            {node.type === "timer_event" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={(data.durationHours as number) || 0}
                    onChange={(e) => update("durationHours", parseInt(e.target.value) || 0)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Auto-approve on timeout</label>
                  <input
                    type="checkbox"
                    checked={(data.autoApprove as boolean) || false}
                    onChange={(e) => update("autoApprove", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                </div>
              </>
            )}

            {node.type === "gateway" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Condition Expression</label>
                <textarea
                  value={(data.condition as string) || ""}
                  onChange={(e) => update("condition", e.target.value)}
                  placeholder="e.g., amount > 10000"
                  rows={3}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-gray-400">Description</label>
              <textarea
                value={(data.description as string) || ""}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </>
        )}

        <div className="pt-2 text-[10px] text-slate-400 dark:text-gray-600">
          ID: {node.id}
        </div>
      </div>
    </div>
  );
}
