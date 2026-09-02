import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { faqs, plans } from "@/lib/siteFacts";

const FALLBACK_REPLY =
  "Sorry, I can't answer that right now — check our FAQ page, or book a call and we'll answer directly.";

const MAX_TURNS = 12; // messages, i.e. 6 back-and-forths
const MAX_MESSAGE_LENGTH = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(): string {
  const faqText = faqs
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");
  const planText = plans
    .map((p) => {
      const bits = [
        `${p.name}: ${p.price} (${p.term})`,
        p.priceNote,
        p.comingSoon ? "Not yet open for signups (\"Coming Soon\")." : null,
        `Includes: ${p.features.join("; ")}.`,
      ].filter(Boolean);
      return bits.join(" ");
    })
    .join("\n\n");

  return `You are the website chat assistant for Throneside Assets, a UK \
property-deal-sourcing membership business. You answer basic visitor \
questions about the business using ONLY the facts below.

MEMBERSHIP PLANS
${planText}

FAQ
${faqText}

RULES
- Only state facts given above. Never invent pricing, dates, guarantees, \
returns, or anything not written here.
- If asked something you don't have facts for (account-specific questions, \
availability of specific deals, legal/tax/financial advice, anything not \
covered above), say you don't have that detail and point them to the \
Contact page ("/contact") to book a call, or "/faq" for more common \
questions.
- Never give financial, legal, or tax advice — direct those questions to \
booking a call.
- Keep answers short (2-4 sentences), plain, and professional — no emoji, \
no exclamation points, no markdown.
- If asked something unrelated to Throneside Assets or property investment, \
politely say you can only help with questions about Throneside Assets.`;
}

function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const cleaned: ChatMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const { role, content } = raw as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
    cleaned.push({ role, content: trimmed });
  }

  if (cleaned[cleaned.length - 1].role !== "user") return null;

  return cleaned.slice(-MAX_TURNS);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages = sanitizeMessages(body?.messages);

  if (!messages) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  let apiKey: string;
  try {
    apiKey = getEnv("ANTHROPIC_API_KEY");
  } catch {
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system: buildSystemPrompt(),
        messages,
      }),
    });

    if (!res.ok) {
      console.error("Chat API: Anthropic request failed", res.status);
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const data = await res.json();
    const text: string | undefined = data?.content?.[0]?.text;

    return NextResponse.json({ reply: text?.trim() || FALLBACK_REPLY });
  } catch (err) {
    console.error("Chat API: request errored", err);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
