"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
}

export function NavItem({ href, label, icon: Icon, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
        isActive
          ? "bg-sidebar-active text-white"
          : "text-sidebar-text hover:bg-sidebar-hover hover:text-white",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      {isActive && (
        <div className="absolute inset-y-1 start-0 w-[3px] rounded-full bg-brand-500" />
      )}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-400")} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

interface NavGroupProps {
  label: string;
  children: React.ReactNode;
  collapsed?: boolean;
  defaultExpanded?: boolean;
}

export function NavGroup({ label, children, collapsed, defaultExpanded = true }: NavGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>{label}</span>
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      )}
      {collapsed && <div className="mx-auto my-3 h-px w-6 bg-white/10" />}
      {(!collapsed && expanded || collapsed) && children}
    </div>
  );
}
