"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

interface NavGroupProps {
  label: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

export function NavGroup({ label, children, collapsed }: NavGroupProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      )}
      {collapsed && <div className="mx-auto my-2 h-px w-6 bg-gray-200" />}
      {children}
    </div>
  );
}
