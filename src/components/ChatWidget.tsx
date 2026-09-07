"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  /** Local-only status line (not sent to the model). */
  notice?: boolean;
};

const STORAGE_KEY = "throneside-chat-v1";
const MAX_STORED = 40;

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi — I'm the Throneside Assets assistant. Ask me about membership, pricing, the deal-sourcing process, or how to get started.",
};

const SUGGESTIONS = [
  "How much does membership cost?",
  "What kinds of deals do you source?",
  "How quickly will I see deals?",
  "How do I join?",
];

const FALLBACK =
  "Sorry, something went wrong. Try again, leave your details below, or visit /contact.";

// If the assistant lands on one of these, nudge the visitor to leave details.
const LEAD_TRIGGERS = [
  /book a call/i,
  /leave your (?:name|details)/i,
  /don't have that detail/i,
  /can only help with/i,
  /\/contact/i,
];

type Stored = { messages?: Message[]; leadSent?: boolean };

function loadStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Stored;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [offerLead, setOfferLead] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadError, setLeadError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore any saved conversation on mount. localStorage isn't available
  // during SSR, so this has to run in an effect rather than an initializer.
  useEffect(() => {
    const stored = loadStored();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored.messages && stored.messages.length > 0) {
      setMessages(stored.messages);
    }
    if (stored.leadSent) setLeadSent(true);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist conversation + lead status.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages: messages.slice(-MAX_STORED),
          leadSent,
        } satisfies Stored)
      );
    } catch {
      // storage full / disabled — non-critical
    }
  }, [messages, leadSent, hydrated]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, loading, leadOpen, offerLead]);

  function outboundHistory(extra?: Message): { role: Message["role"]; content: string }[] {
    const base = messages
      .filter((m) => !m.notice)
      .slice(1) // drop the greeting
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    if (extra) base.push({ role: extra.role, content: extra.content.slice(0, 1000) });
    return base;
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const outbound = outboundHistory({ role: "user", content });
    setMessages((cur) => [
      ...cur,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);
    setOfferLead(false);

    const chunks: string[] = [];
    let finalText = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outbound }),
      });

      if (!res.ok || !res.body) throw new Error("bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
        const snapshot = chunks.join("");
        setMessages((cur) => {
          const copy = cur.slice();
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }
      finalText = chunks.join("").trim();
      if (!finalText) throw new Error("empty");
    } catch {
      finalText = chunks.join("").trim() || FALLBACK;
      const settled = finalText;
      setMessages((cur) => {
        const copy = cur.slice();
        copy[copy.length - 1] = { role: "assistant", content: settled };
        return copy;
      });
    } finally {
      setLoading(false);
    }

    if (!leadSent && LEAD_TRIGGERS.some((re) => re.test(finalText))) {
      setOfferLead(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (leadBusy) return;
    setLeadError("");
    setLeadBusy(true);
    try {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          message: leadMessage,
          transcript: messages
            .filter((m) => !m.notice)
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLeadError(data?.error || "Could not send that right now.");
        return;
      }
      setLeadSent(true);
      setLeadOpen(false);
      setOfferLead(false);
      setLeadMessage("");
      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          notice: true,
          content: `Thanks, ${leadName.split(/\s+/)[0]} — the team will be in touch at ${leadEmail} soon.`,
        },
      ]);
    } catch {
      setLeadError("Could not send that right now — please try /contact.");
    } finally {
      setLeadBusy(false);
    }
  }

  const showSuggestions =
    !loading && messages.filter((m) => !m.notice).length <= 1;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[23rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border rule-strong bg-ink-soft shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b rule bg-ink px-4 py-3">
            <p className="ledger-figure text-xs tracking-[0.18em] text-brass-bright">
              THRONESIDE ASSISTANT
            </p>
            <div className="flex items-center gap-3">
              {!leadSent && (
                <button
                  type="button"
                  onClick={() => {
                    setLeadOpen((v) => !v);
                    setLeadError("");
                  }}
                  className="text-xs text-paper-dim underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brass-bright"
                >
                  Talk to the team
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-paper-dim transition-colors hover:text-paper"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) =>
              m.notice ? (
                <p
                  key={i}
                  className="mx-auto max-w-[90%] text-center text-xs text-ledger-green"
                >
                  {m.content}
                </p>
              ) : (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-brass text-ink"
                      : "border rule bg-ink text-paper-dim"
                  }`}
                >
                  {m.content || (loading ? "…" : "")}
                </div>
              )
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border rule-strong px-3 py-1.5 text-xs text-paper-dim transition-colors hover:border-brass hover:text-paper"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {offerLead && !leadOpen && !leadSent && (
              <button
                type="button"
                onClick={() => setLeadOpen(true)}
                className="block w-full rounded-md border border-brass bg-brass/10 px-3 py-2 text-left text-xs text-brass-bright transition-colors hover:bg-brass/20"
              >
                Leave your name and email → the team will follow up
              </button>
            )}

            {leadOpen && !leadSent && (
              <form
                onSubmit={submitLead}
                className="space-y-2 rounded-md border rule-strong bg-ink p-3"
              >
                <p className="text-xs text-paper-dim">
                  Leave your details and the team will get back to you.
                </p>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  maxLength={120}
                  className="w-full rounded-md border rule bg-ink-soft px-3 py-2 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={200}
                  className="w-full rounded-md border rule bg-ink-soft px-3 py-2 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
                />
                <textarea
                  value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  placeholder="Anything you'd like us to know (optional)"
                  rows={2}
                  maxLength={1000}
                  className="w-full resize-none rounded-md border rule bg-ink-soft px-3 py-2 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
                />
                {leadError && (
                  <p className="text-xs text-brass-bright">{leadError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={leadBusy}
                    className="rounded-full bg-brass px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-50"
                  >
                    {leadBusy ? "Sending…" : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadOpen(false);
                      setLeadError("");
                    }}
                    className="text-xs text-paper-dim transition-colors hover:text-paper"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading && messages[messages.length - 1]?.content === "" && (
              <div className="max-w-[85%] rounded-md border rule bg-ink px-3 py-2 text-sm text-paper-dim">
                Typing…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t rule p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about membership, pricing, deals…"
              maxLength={1000}
              className="flex-1 rounded-md border rule bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-brass px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="rounded-full bg-brass px-5 py-3 text-sm font-medium text-ink shadow-lg transition-colors hover:bg-brass-bright"
      >
        {open ? "Close" : "Ask a question"}
      </button>
    </div>
  );
}
