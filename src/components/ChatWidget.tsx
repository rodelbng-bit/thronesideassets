"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi, I'm the Throneside Assets assistant. Ask me about membership, pricing, or how deal sourcing works.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== GREETING),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply: string =
        data?.reply ||
        "Sorry, something went wrong. Try again, or visit /contact.";
      setMessages((cur) => [...cur, { role: "assistant", content: reply }]);
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Try again, or visit /contact.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border rule bg-ink-soft shadow-xl">
          <div className="flex items-center justify-between border-b rule px-4 py-3">
            <p className="ledger-figure text-sm text-brass-bright">
              ASK US ANYTHING
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-paper-dim transition-colors hover:text-paper"
            >
              ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-brass text-ink"
                    : "border rule bg-ink text-paper-dim"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
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
              placeholder="Type a question…"
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
        {open ? "Close" : "Chat with us"}
      </button>
    </div>
  );
}
