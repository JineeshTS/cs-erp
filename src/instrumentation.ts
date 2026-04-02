/**
 * Next.js instrumentation hook — runs once at server startup.
 * Registers all event bus handlers so they're ready before any request.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only register on the Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    await import("./lib/events/register-handlers");
    console.log("[instrumentation] Event bus handlers registered");
  }
}
