/**
 * Imports all event handler modules to register them with the event bus.
 * Import this file once at app startup (e.g., in instrumentation.ts or layout.tsx).
 *
 * Each handler file self-registers by calling eventBus.on() at module scope.
 */

import "./handlers/booking-handlers";
import "./handlers/container-handlers";
import "./handlers/vessel-handlers";
import "./handlers/financial-handlers";
import "./handlers/compliance-handlers";
import "./handlers/approval-handlers";

export const EVENT_HANDLERS_REGISTERED = true;
