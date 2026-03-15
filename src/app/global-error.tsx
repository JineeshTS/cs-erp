"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "32px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px", textAlign: "center" }}>
            A critical error occurred. Please try again or contact support.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
