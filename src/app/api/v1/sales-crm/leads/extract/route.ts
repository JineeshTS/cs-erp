import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const extractInputSchema = z.object({
  text: z.string().min(10).max(10000),
});

const EXTRACTION_PROMPT = `You are a data extraction agent for a container shipping ERP system.
Extract structured lead data from the following inquiry text. Return ONLY valid JSON with these fields (omit any field not mentioned):

- companyName: string (company name)
- contactName: string (full name of the person)
- contactEmail: string (email address)
- contactPhone: string (phone number)
- jobTitle: string (their role/title)
- country: string (ISO 2-letter code, e.g., QA for Qatar, AE for UAE, IN for India)
- city: string
- industry: string (e.g., "Container Shipping", "Manufacturing", "Trading")
- estimatedTeu: number (monthly TEU volume if mentioned)
- tradeLane: string (e.g., "Middle East - Indian Subcontinent")
- source: string (one of: website, referral, trade_show, cold_call, email_campaign, partner, social_media, other)
- notes: string (summarize the key requirements: cargo type, container size, frequency, urgency, any competitive info)

Rules:
- For country, infer from city/country mentions (Doha→QA, Dubai→AE, Mumbai→IN, Singapore→SG)
- For source, default to "email_campaign" if it looks like an email, "website" if it looks like a web form
- For notes, capture cargo type, container size preference, urgency, and competitive mentions
- estimatedTeu should be the MONTHLY number (convert from annual if needed)
- Return ONLY the JSON object, no markdown, no explanation`;

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = extractInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Text must be 10-10000 characters", details: parsed.error } },
        { status: 422 }
      );
    }

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: `${EXTRACTION_PROMPT}\n\n--- INQUIRY TEXT ---\n${parsed.data.text}` },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: { code: "EXTRACTION_FAILED", message: "AI did not return text" } },
        { status: 500 }
      );
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    const extracted = JSON.parse(jsonText);

    // Validate the extracted fields
    const allowedFields = new Set([
      "companyName", "contactName", "contactEmail", "contactPhone",
      "jobTitle", "country", "city", "industry", "estimatedTeu",
      "tradeLane", "source", "notes",
    ]);

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(extracted)) {
      if (allowedFields.has(key) && value !== null && value !== undefined && value !== "") {
        cleaned[key] = value;
      }
    }

    return NextResponse.json({ data: cleaned });
  } catch (error) {
    console.error("Lead extraction failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to extract lead data" } },
      { status: 500 }
    );
  }
}
