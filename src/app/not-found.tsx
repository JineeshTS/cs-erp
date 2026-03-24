import Link from "next/link";
import { Ship } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white">
        <Ship className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
        404
      </h1>
      <p className="mt-2 text-lg text-foreground/60">
        Page not found
      </p>
      <p className="mt-1 text-sm text-foreground/40">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
