import { Ship } from "lucide-react";
import Link from "next/link";

/**
 * ERP-094: Minimal public layout with CS-ERP branding, no auth.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Ship className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              CS-ERP
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t bg-white py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} CS ERP. All rights reserved.
      </footer>
    </div>
  );
}
