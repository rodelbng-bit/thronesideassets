import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { faqs, plans } from "@/lib/siteFacts";

const FALLBACK_REPLY =
  "Sorry, I can't answer that right now — check our FAQ page, or leave your details below and the team will follow up.";

const MAX_TURNS = 12; // messages, i.e. 6 back-and-forths
const MAX_MESSAGE_LENGTH = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(): string {
  const faqText = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
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
covered above), say you don't have that detail and invite them to leave \
their name and email so the team can follow up, or to visit the Contact \
page ("/contact") to book a call.
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

function textResponse(text: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
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
    return textResponse(FALLBACK_REPLY);
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        stream: true,
        system: buildSystemPrompt(),
        messages,
      }),
    });
  } catch (err) {
    console.error("Chat API: request errored", err);
    return textResponse(FALLBACK_REPLY);
  }

  if (!upstream.ok || !upstream.body) {
    console.error("Chat API: Anthropic request failed", upstream.status);
    return textResponse(FALLBACK_REPLY);
  }

  // Re-stream Anthropic's SSE as plain text deltas the browser can append
  // straight into the message bubble.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      let emitted = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            const dataLine = evt
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const json = dataLine.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              if (
                parsed.type === "content_block_delta" &&
                parsed.delta?.type === "text_delta" &&
                typeof parsed.delta.text === "string" &&
                parsed.delta.text
              ) {
                emitted = true;
                controller.enqueue(encoder.encode(parsed.delta.text));
              }
            } catch {
              // ping / keep-alive lines — ignore
            }
          }
        }
        if (!emitted) controller.enqueue(encoder.encode(FALLBACK_REPLY));
      } catch (err) {
        console.error("Chat API: stream errored", err);
        if (!emitted) controller.enqueue(encoder.encode(FALLBACK_REPLY));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
