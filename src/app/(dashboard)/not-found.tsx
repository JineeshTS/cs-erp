import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-foreground/60">
        The page you are looking for does not exist or has been moved.
        Check the URL or navigate using the sidebar.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
