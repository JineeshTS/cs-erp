import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Ship, LogOut } from "lucide-react";

/**
 * Portal layout — public-facing customer portal with separate auth.
 * Uses portal_session cookie (independent from internal cs_access_token).
 * No sidebar — just a header with logo + logout.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const portalSession = cookieStore.get("portal_session")?.value;

  // Allow login page without session
  // Other portal pages require authentication — handled per-page

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Ship className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              CS-ERP Portal
            </span>
          </Link>

          {portalSession && (
            <form action="/api/portal/auth" method="POST">
              <input type="hidden" name="_method" value="DELETE" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} CS ERP. All rights reserved.
      </footer>
    </div>
  );
}
