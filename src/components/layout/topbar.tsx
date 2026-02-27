"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  userName: string;
  userEmail: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100 focus:outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-gray-700 sm:inline-block">
            {userName}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
            <Settings className="me-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="me-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
