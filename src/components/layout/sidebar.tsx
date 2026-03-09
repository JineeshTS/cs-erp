"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Ship,
} from "lucide-react";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";
import { CATEGORIES, canSeeCategory } from "@/lib/navigation/categories";

interface SidebarProps {
  tenantName: string;
  permissions: string[];
}

export function Sidebar({ tenantName, permissions: perms }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const visibleCategories = CATEGORIES.filter((cat) =>
    canSeeCategory(perms, cat.permissionPrefixes)
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar-bg transition-all duration-200",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Ship className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="ms-3 min-w-0">
            <p className="truncate text-sm font-bold text-white">{tenantName}</p>
            <p className="text-[11px] font-medium text-slate-400">Shipping ERP</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {visibleCategories.map((cat) => (
          <NavItem
            key={cat.slug}
            href={cat.href}
            label={cat.label}
            icon={cat.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
