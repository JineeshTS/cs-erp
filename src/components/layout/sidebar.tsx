"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
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
        "flex h-full flex-col border-e bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-3">
        <Building2 className="h-6 w-6 shrink-0 text-gray-700" />
        {!collapsed && (
          <span className="ms-2 truncate text-sm font-bold text-gray-900">
            {tenantName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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

      {/* Collapse button */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
