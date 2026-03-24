"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-error-light text-error">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-foreground/60">
        An unexpected error occurred while loading this page.
        Please try again or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-foreground/40">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
