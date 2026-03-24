/**
 * Client-side CSRF helper.
 * Reads the cs_csrf cookie value for inclusion in mutation request headers.
 */

const CSRF_COOKIE_NAME = "cs_csrf";

/**
 * Read the CSRF token from the cs_csrf cookie.
 * Returns empty string if cookie not found (login will set it).
 */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return "";
}

/**
 * Get headers object with CSRF token included.
 * Use this in fetch() calls for mutations.
 */
export function csrfHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-csrf-token": getCsrfToken(),
    ...extra,
  };
}
