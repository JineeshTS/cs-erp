import Anthropic from "@anthropic-ai/sdk";
import { db, setTenantRLS } from "@/lib/db";
import {
  aiChatSessions,
  aiChatMessages,
  ports,
  vessels,
  scmCustomers,
  cspPortalBookings,
  firmFreightInvoices,
  odmBillsOfLading,
} from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the CS-ERP AI Assistant — an intelligent copilot for a Container Shipping ERP system used by shipping companies in Qatar, UAE, Saudi Arabia, and India.

## Your Capabilities
You can help users with:
1. **Natural conversation** about shipping, logistics, CRM, and ERP questions
2. **Create/fill CRM records** — customers, leads, opportunities, contracts, quotations, campaigns
3. **Navigate pages** — direct users to specific ERP pages
4. **Query data** — answer questions about customers, pipeline, revenue, etc.
5. **Analyze files** — when users upload PDFs, spreadsheets, or documents

## Available CRM Entities
- **Customers** — company profiles with segmentation, tiers, credit limits
- **Leads** — sales leads with source, status, qualification
- **Opportunities** — sales pipeline with stages, probability, value
- **Contracts** — service contracts with line items, terms
- **Quotations** — rate quotations with pricing, validity
- **Campaigns** — marketing campaigns with targeting, budget

## Action Format
When you need to trigger an action, include a JSON block at the END of your response wrapped in \`\`\`action tags:

\`\`\`action
{"action": "fill_form", "entity": "customer", "page": "/sales-crm/customers/new", "formData": {"companyName": "...", "customerType": "shipper", "country": "QA"}}
\`\`\`

\`\`\`action
{"action": "navigate", "page": "/sales-crm/opportunities"}
\`\`\`

\`\`\`action
{"action": "query", "entity": "customers", "filters": {"status": "active"}}
\`\`\`

## Rules
1. **Fill & Confirm Mode** — Never create records directly. Always fill form data and let users review before submitting.
2. When filling forms, use realistic field names matching CRM fields: companyName, customerType (shipper/consignee/freight_forwarder/nvocc), country (ISO 2-letter), tier (standard/silver/gold/platinum), status (active/inactive/prospect).
3. Be concise but helpful. Use shipping industry terminology appropriately.
4. For navigation, use correct page paths starting with /sales-crm/, /operations/, /finance/, /admin/.
5. When users upload files, acknowledge and analyze the content.
6. Always respond in English unless the user writes in another language.`;

// Safety constants
const MAX_CONTEXT_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 4000;
const SESSION_TOKEN_CAP = 100_000;
const API_TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 1;
const VALID_ACTIONS = new Set(["fill_form", "navigate", "query"]);

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AgentAction {
  action: string;
  entity?: string;
  page?: string;
  formData?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  type?: string;
  data?: unknown[];
}

interface ChatResult {
  content: string;
  agentAction?: AgentAction;
  tokensUsed?: number;
}

function parseActionFromResponse(content: string): {
  cleanContent: string;
  agentAction?: AgentAction;
} {
  const actionRegex = /```action\s*\n([\s\S]*?)\n```/;
  const match = content.match(actionRegex);

  if (!match) {
    return { cleanContent: content };
  }

  try {
    const agentAction = JSON.parse(match[1].trim()) as AgentAction;

    // Validate action type against allowlist
    if (!VALID_ACTIONS.has(agentAction.action)) {
      console.warn(`[AI Chat] Unknown action type rejected: ${agentAction.action}`);
      const cleanContent = content.replace(actionRegex, "").trim();
      return { cleanContent };
    }

    const cleanContent = content.replace(actionRegex, "").trim();
    return { cleanContent, agentAction };
  } catch {
    return { cleanContent: content };
  }
}

// ═══════════════════════════════════════════════════════════
// ERP-106: AI CHAT DB QUERY CAPABILITY
// Executes safe read-only queries via Drizzle ORM with tenant isolation.
// NEVER allows raw SQL — only structured queries against a whitelist of tables.
// ═══════════════════════════════════════════════════════════

const ALLOWED_ENTITIES = ["ports", "vessels", "customers", "bookings", "invoices", "bills_of_lading"] as const;

/** Normalize entity name from AI response to a canonical key */
function resolveEntityName(raw: string): (typeof ALLOWED_ENTITIES)[number] | null {
  const normalized = raw.toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, (typeof ALLOWED_ENTITIES)[number]> = {
    ports: "ports", port: "ports",
    vessels: "vessels", vessel: "vessels",
    customers: "customers", customer: "customers",
    bookings: "bookings", booking: "bookings",
    invoices: "invoices", invoice: "invoices", freight_invoices: "invoices",
    bls: "bills_of_lading", bl: "bills_of_lading",
    bills_of_lading: "bills_of_lading", bill_of_lading: "bills_of_lading",
  };
  return aliases[normalized] ?? null;
}

/**
 * Execute a safe read-only query for AI chat "query" actions.
 * Uses a switch to handle each table with proper typing.
 * Returns formatted results as a markdown string, max 20 rows.
 */
async function executeQueryAction(
  tenantId: string,
  action: AgentAction
): Promise<string> {
  const entity = resolveEntityName(action.entity ?? "");
  if (!entity) {
    return `I can query: Ports, Vessels, Customers, Bookings, Invoices, Bills of Lading. The entity "${action.entity}" is not in the allowed list.`;
  }

  const filters = action.filters ?? {};
  const statusFilter = typeof filters.status === "string" ? filters.status.slice(0, 50) : undefined;

  try {
    await setTenantRLS(tenantId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let results: Record<string, any>[] = [];
    let label = "";
    let nameKey = "";

    switch (entity) {
      case "ports": {
        label = "Ports";
        nameKey = "name";
        const conds = [eq(ports.tenantId, tenantId), isNull(ports.deletedAt)];
        results = await db.select().from(ports).where(and(...conds)).limit(20);
        break;
      }
      case "vessels": {
        label = "Vessels";
        nameKey = "name";
        const conds = [eq(vessels.tenantId, tenantId), isNull(vessels.deletedAt)];
        results = await db.select().from(vessels).where(and(...conds)).limit(20);
        break;
      }
      case "customers": {
        label = "Customers";
        nameKey = "companyName";
        const conds = [eq(scmCustomers.tenantId, tenantId), isNull(scmCustomers.deletedAt)];
        if (statusFilter) conds.push(eq(scmCustomers.status, statusFilter));
        results = await db.select().from(scmCustomers).where(and(...conds)).limit(20);
        break;
      }
      case "bookings": {
        label = "Bookings";
        nameKey = "bookingRef";
        const conds = [eq(cspPortalBookings.tenantId, tenantId), isNull(cspPortalBookings.deletedAt)];
        if (statusFilter) conds.push(eq(cspPortalBookings.status, statusFilter));
        results = await db.select().from(cspPortalBookings).where(and(...conds)).limit(20);
        break;
      }
      case "invoices": {
        label = "Freight Invoices";
        nameKey = "invoiceNumber";
        const conds = [eq(firmFreightInvoices.tenantId, tenantId), isNull(firmFreightInvoices.deletedAt)];
        if (statusFilter) conds.push(eq(firmFreightInvoices.status, statusFilter));
        results = await db.select().from(firmFreightInvoices).where(and(...conds)).limit(20);
        break;
      }
      case "bills_of_lading": {
        label = "Bills of Lading";
        nameKey = "blNumber";
        const conds = [eq(odmBillsOfLading.tenantId, tenantId), isNull(odmBillsOfLading.deletedAt)];
        if (statusFilter) conds.push(eq(odmBillsOfLading.blStatus, statusFilter));
        results = await db.select().from(odmBillsOfLading).where(and(...conds)).limit(20);
        break;
      }
    }

    if (results.length === 0) {
      return `No ${label} found matching your criteria.`;
    }

    const rows = results.map((row, idx) => {
      const nameVal = row[nameKey] ?? row.id ?? "N/A";
      const status = row.status ?? row.blStatus ?? "";
      const id = String(row.id ?? "").slice(0, 8);
      return `${idx + 1}. **${nameVal}**${status ? ` (${status})` : ""} — ID: ${id}...`;
    });

    return `Found ${results.length} ${label}:\n${rows.join("\n")}${
      results.length === 20 ? "\n\n_Showing first 20 results. Refine your search for more specific results._" : ""
    }`;
  } catch (err) {
    console.error("[AI Chat Query] Error:", err);
    return "I encountered an error while querying the database. Please try again.";
  }
}

/**
 * Truncate message content to prevent unbounded context.
 */
function truncateContent(content: string): string {
  if (content.length <= MAX_MESSAGE_CHARS) return content;
  return content.slice(0, MAX_MESSAGE_CHARS) + "\n[...truncated]";
}

/**
 * Wrap user messages in XML tags to mitigate prompt injection.
 */
function wrapUserMessage(content: string): string {
  return `<user_message>${content}</user_message>`;
}

/**
 * Get total tokens used in a session.
 */
async function getSessionTokenCount(sessionId: string, tenantId: string): Promise<number> {
  const result = await db
    .select({ total: aiChatMessages.tokensUsed })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.sessionId, sessionId),
        eq(aiChatMessages.tenantId, tenantId)
      )
    );

  return result.reduce((sum, r) => sum + (r.total ?? 0), 0);
}

/**
 * Call Claude API with timeout and retry logic.
 */
async function callClaudeWithRetry(
  messages: Anthropic.MessageParam[],
  retries = MAX_RETRIES
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await anthropic.messages.create(
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages,
        },
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      return response;
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isRetryable =
        (err instanceof Error && err.name === "AbortError") ||
        (err instanceof Anthropic.APIError && err.status >= 500);

      if (isRetryable && attempt < retries) {
        console.warn(`[AI Chat] Retry ${attempt + 1}/${retries} after error:`, err instanceof Error ? err.message : err);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unexpected: exhausted retries without response");
}

export async function createSession(
  tenantId: string,
  userId: string
): Promise<{ id: string }> {
  const [session] = await db
    .insert(aiChatSessions)
    .values({
      tenantId,
      userId,
      title: "New Chat",
      status: "active",
    })
    .returning({ id: aiChatSessions.id });

  return session;
}

export async function getSessions(
  tenantId: string,
  userId: string,
  cursor?: string,
  limit = 20
) {
  const conditions = [
    eq(aiChatSessions.tenantId, tenantId),
    eq(aiChatSessions.userId, userId),
    isNull(aiChatSessions.deletedAt),
  ];

  if (cursor) {
    const cc = parseCompoundCursor(cursor);
    if (cc) conditions.push(cursorCondition(aiChatSessions.createdAt, aiChatSessions.id, cc));
  }

  const results = await db
    .select()
    .from(aiChatSessions)
    .where(and(...conditions))
    .orderBy(desc(aiChatSessions.createdAt), desc(aiChatSessions.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data,
    meta: {
      cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined,
      hasMore,
    },
  };
}

export async function getSession(sessionId: string, tenantId: string) {
  const [session] = await db
    .select()
    .from(aiChatSessions)
    .where(
      and(
        eq(aiChatSessions.id, sessionId),
        eq(aiChatSessions.tenantId, tenantId),
        isNull(aiChatSessions.deletedAt)
      )
    )
    .limit(1);

  return session ?? null;
}

export async function archiveSession(sessionId: string, tenantId: string) {
  const [updated] = await db
    .update(aiChatSessions)
    .set({ deletedAt: new Date(), status: "archived" })
    .where(
      and(
        eq(aiChatSessions.id, sessionId),
        eq(aiChatSessions.tenantId, tenantId)
      )
    )
    .returning({ id: aiChatSessions.id });

  return updated ?? null;
}

export async function getMessages(
  sessionId: string,
  tenantId: string,
  cursor?: string,
  limit = 50
) {
  const conditions = [
    eq(aiChatMessages.sessionId, sessionId),
    eq(aiChatMessages.tenantId, tenantId),
  ];

  if (cursor) {
    const cc = parseCompoundCursor(cursor);
    if (cc) conditions.push(cursorCondition(aiChatMessages.createdAt, aiChatMessages.id, cc));
  }

  const results = await db
    .select()
    .from(aiChatMessages)
    .where(and(...conditions))
    .orderBy(desc(aiChatMessages.createdAt), desc(aiChatMessages.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data: data.reverse(),
    meta: {
      cursor: hasMore
        ? data[0].createdAt.toISOString()
        : undefined,
      hasMore,
    },
  };
}

export async function chat(
  sessionId: string,
  tenantId: string,
  userMessage: string,
  files?: FileAttachment[]
): Promise<ChatResult> {
  // Check per-session token cap
  const sessionTokens = await getSessionTokenCount(sessionId, tenantId);
  if (sessionTokens >= SESSION_TOKEN_CAP) {
    return {
      content: "This chat session has reached its token limit. Please start a new chat session.",
      tokensUsed: 0,
    };
  }

  // Save user message
  await db.insert(aiChatMessages).values({
    tenantId,
    sessionId,
    role: "user",
    content: userMessage,
    fileAttachments: files && files.length > 0 ? files : null,
  });

  // Update session title from first message
  const [session] = await db
    .select({ title: aiChatSessions.title })
    .from(aiChatSessions)
    .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.tenantId, tenantId)))
    .limit(1);

  if (session?.title === "New Chat") {
    const title = userMessage.slice(0, 100);
    await db
      .update(aiChatSessions)
      .set({ title })
      .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.tenantId, tenantId)));
  }

  // Load recent messages for context (capped at MAX_CONTEXT_MESSAGES)
  const recentMessages = await db
    .select({
      role: aiChatMessages.role,
      content: aiChatMessages.content,
    })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.sessionId, sessionId),
        eq(aiChatMessages.tenantId, tenantId)
      )
    )
    .orderBy(desc(aiChatMessages.createdAt), desc(aiChatMessages.id))
    .limit(MAX_CONTEXT_MESSAGES);

  // Build messages array for Claude (reversed to chronological, truncated, XML-wrapped)
  const messages: Anthropic.MessageParam[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.role === "user"
        ? wrapUserMessage(truncateContent(msg.content))
        : truncateContent(msg.content),
    }));

  // Add file context to the last user message if files attached
  if (files && files.length > 0) {
    const fileInfo = files
      .map((f) => `[Attached file: ${f.name} (${f.type}, ${f.size} bytes)]`)
      .join("\n");
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user") {
      lastMsg.content = `${fileInfo}\n\n${lastMsg.content}`;
    }
  }

  // Call Claude with timeout + retry
  const response = await callClaudeWithRetry(messages);

  const rawContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  const { cleanContent, agentAction } = parseActionFromResponse(rawContent);

  const tokensUsed =
    (response.usage?.input_tokens ?? 0) +
    (response.usage?.output_tokens ?? 0);

  // ERP-106: If action is "query", execute the DB query and append results
  let finalContent = cleanContent;
  if (agentAction?.action === "query" && agentAction.entity) {
    const queryResults = await executeQueryAction(tenantId, agentAction);
    finalContent = `${cleanContent}\n\n---\n**Query Results:**\n${queryResults}`;
  }

  // Save assistant message
  await db.insert(aiChatMessages).values({
    tenantId,
    sessionId,
    role: "assistant",
    content: finalContent,
    agentAction: agentAction ?? null,
    tokensUsed,
  });

  return {
    content: finalContent,
    agentAction,
    tokensUsed,
  };
}

export async function chatStream(
  sessionId: string,
  tenantId: string,
  userMessage: string,
  files?: FileAttachment[]
): Promise<{
  stream: AsyncIterable<string>;
  done: Promise<ChatResult>;
}> {
  // Check per-session token cap
  const sessionTokens = await getSessionTokenCount(sessionId, tenantId);
  if (sessionTokens >= SESSION_TOKEN_CAP) {
    const result: ChatResult = {
      content: "This chat session has reached its token limit. Please start a new chat session.",
      tokensUsed: 0,
    };
    return {
      stream: (async function* () { yield result.content; })(),
      done: Promise.resolve(result),
    };
  }

  // Save user message
  await db.insert(aiChatMessages).values({
    tenantId,
    sessionId,
    role: "user",
    content: userMessage,
    fileAttachments: files && files.length > 0 ? files : null,
  });

  // Update session title from first message
  const [session] = await db
    .select({ title: aiChatSessions.title })
    .from(aiChatSessions)
    .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.tenantId, tenantId)))
    .limit(1);

  if (session?.title === "New Chat") {
    const title = userMessage.slice(0, 100);
    await db
      .update(aiChatSessions)
      .set({ title })
      .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.tenantId, tenantId)));
  }

  // Load recent messages for context (capped at MAX_CONTEXT_MESSAGES)
  const recentMessages = await db
    .select({
      role: aiChatMessages.role,
      content: aiChatMessages.content,
    })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.sessionId, sessionId),
        eq(aiChatMessages.tenantId, tenantId)
      )
    )
    .orderBy(desc(aiChatMessages.createdAt), desc(aiChatMessages.id))
    .limit(MAX_CONTEXT_MESSAGES);

  const messages: Anthropic.MessageParam[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.role === "user"
        ? wrapUserMessage(truncateContent(msg.content))
        : truncateContent(msg.content),
    }));

  if (files && files.length > 0) {
    const fileInfo = files
      .map((f) => `[Attached file: ${f.name} (${f.type}, ${f.size} bytes)]`)
      .join("\n");
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user") {
      lastMsg.content = `${fileInfo}\n\n${lastMsg.content}`;
    }
  }

  // Stream with 60s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const stream = anthropic.messages.stream(
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    },
    { signal: controller.signal }
  );

  let fullContent = "";

  const asyncIterable: AsyncIterable<string> = {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const event = await (stream as AsyncIterable<Anthropic.MessageStreamEvent>)[Symbol.asyncIterator]().next();
          if (event.done) {
            return { value: "", done: true };
          }
          const chunk = event.value;
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullContent += chunk.delta.text;
            return { value: chunk.delta.text, done: false };
          }
          return { value: "", done: false };
        },
      };
    },
  };

  const done = stream.finalMessage().then(async (finalMessage) => {
    clearTimeout(timeout);

    const { cleanContent, agentAction } =
      parseActionFromResponse(fullContent);

    const tokensUsed =
      (finalMessage.usage?.input_tokens ?? 0) +
      (finalMessage.usage?.output_tokens ?? 0);

    await db.insert(aiChatMessages).values({
      tenantId,
      sessionId,
      role: "assistant",
      content: cleanContent,
      agentAction: agentAction ?? null,
      tokensUsed,
    });

    return { content: cleanContent, agentAction, tokensUsed };
  });

  return { stream: asyncIterable, done };
}
