import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { aiChatSessions, aiChatMessages } from "@/db/schema";
import { eq, and, desc, isNull, lt } from "drizzle-orm";

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
    const cleanContent = content.replace(actionRegex, "").trim();
    return { cleanContent, agentAction };
  } catch {
    return { cleanContent: content };
  }
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
    conditions.push(lt(aiChatSessions.createdAt, new Date(cursor)));
  }

  const results = await db
    .select()
    .from(aiChatSessions)
    .where(and(...conditions))
    .orderBy(desc(aiChatSessions.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data,
    meta: {
      cursor: hasMore
        ? data[data.length - 1].createdAt.toISOString()
        : undefined,
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
    conditions.push(lt(aiChatMessages.createdAt, new Date(cursor)));
  }

  const results = await db
    .select()
    .from(aiChatMessages)
    .where(and(...conditions))
    .orderBy(desc(aiChatMessages.createdAt))
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

  // Load recent messages for context
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
    .orderBy(desc(aiChatMessages.createdAt))
    .limit(20);

  // Build messages array for Claude (reversed to chronological order)
  const messages: Anthropic.MessageParam[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
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

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });

  const rawContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  const { cleanContent, agentAction } = parseActionFromResponse(rawContent);

  const tokensUsed =
    (response.usage?.input_tokens ?? 0) +
    (response.usage?.output_tokens ?? 0);

  // Save assistant message
  await db.insert(aiChatMessages).values({
    tenantId,
    sessionId,
    role: "assistant",
    content: cleanContent,
    agentAction: agentAction ?? null,
    tokensUsed,
  });

  return {
    content: cleanContent,
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

  // Load recent messages for context
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
    .orderBy(desc(aiChatMessages.createdAt))
    .limit(20);

  const messages: Anthropic.MessageParam[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
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

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });

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
