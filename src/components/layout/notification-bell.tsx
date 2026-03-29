"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  priority: string;
  readAt: string | null;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications?limit=10");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
        setUnreadCount(json.meta?.unreadCount || 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/v1/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch("/api/v1/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
        className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-gray-800",
                    !n.readAt && "bg-brand-50/50 dark:bg-brand-950/10"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-medium text-slate-800 dark:text-gray-200">
                        {n.title}
                      </span>
                      {n.priority === "high" || n.priority === "critical" ? (
                        <span className="shrink-0 rounded bg-red-100 px-1 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          {n.priority}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-gray-400">
                      {n.body}
                    </p>
                    <span className="mt-1 text-[10px] text-slate-400 dark:text-gray-500">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  {!n.readAt && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="mt-1 shrink-0 text-slate-300 hover:text-brand-500 dark:text-gray-600"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-2 text-center dark:border-gray-700">
            <Link
              href="/workflow-notification-engine/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
