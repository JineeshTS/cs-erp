import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { sendNotificationEmail } from "@/lib/email";
import { z } from "zod";

const bodySchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(500),
  html: z.string().min(1).max(50000),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-internal-api-key");
  const expected = process.env.INTERNAL_API_KEY;
  if (!apiKey || !expected) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing API key" } }, { status: 401 });
  }

  const a = Buffer.from(apiKey);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid API key" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid body", details: parsed.error } }, { status: 400 });
    }

    const { to, subject, html } = parsed.data;
    const sent = await sendNotificationEmail(to, subject, html);

    return NextResponse.json({ data: { sent, to } });
  } catch (error) {
    console.error("[internal/send-email] Error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to send email" } }, { status: 500 });
  }
}
