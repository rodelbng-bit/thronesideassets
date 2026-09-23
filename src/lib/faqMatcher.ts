import { faqs, plans } from "@/lib/siteFacts";

// Keyword-based FAQ lookup for the chat widget, used whenever the
// Anthropic-backed answer isn't available (no ANTHROPIC_API_KEY, no
// credits, upstream error). Answers are returned verbatim from
// siteFacts so nothing is invented.

export const NO_MATCH_REPLY =
  "I don't have an answer for that one. You can check our FAQ page (/faq), book a call on the Contact page (/contact), or leave your details below and the team will follow up.";

const GREETING_REPLY =
  "Hi, I can answer questions about membership pricing, the plans, the kinds of deals we source, how quickly you'll see deals, and how to join. What would you like to know?";

type Entry = { answer: string; keywords: string[]; question?: string };

// Extra search terms per FAQ, keyed by the question text in siteFacts.
// A FAQ missing here still matches on the words in its question.
const FAQ_KEYWORDS: Record<string, string[]> = {
  "What are your fees?": [
    "fee", "price", "pricing", "cost", "much", "pay", "payment", "charge",
    "expensive", "membership", "subscription", "monthly", "upfront",
    "essential", "£",
  ],
  "How does the 3-month partner programme work?": [
    "partner", "programme", "program", "free", "waive", "waived", "trial",
    "3", "three", "first",
  ],
  "What kind of deals do you source?": [
    "kind", "type", "source", "strategy", "strategies", "r2r", "rent",
    "sa", "serviced", "accommodation", "hmo", "btl", "buy", "let", "brrr",
    "property", "properties",
  ],
  "How quickly will I see deals?": [
    "quick", "quickly", "fast", "soon", "long", "wait", "timeline", "time",
    "week", "first", "start", "update",
  ],
  "Do I have to take a deal?": [
    "have", "must", "obligation", "obligated", "commit", "commitment",
    "reject", "decline", "turn", "refuse", "take", "forced",
  ],
};

function planAnswer(p: (typeof plans)[number]): string {
  return [
    `${p.name}: ${p.price} (${p.term}).`,
    p.priceNote ? `${p.priceNote}.` : null,
    p.comingSoon ? "Not yet open for signups (coming soon)." : null,
    `Includes: ${p.features.join("; ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

const ENTRIES: Entry[] = [
  ...faqs.map((f) => ({
    question: f.q,
    answer: f.a,
    keywords: FAQ_KEYWORDS[f.q] ?? [],
  })),
  ...plans.map((p) => ({
    question: p.name,
    answer: planAnswer(p),
    keywords: [
      ...p.name.toLowerCase().split(/\s+/),
      "plan", "package", "include", "feature", "tier",
      ...(p.comingSoon ? ["priority", "strategy", "call", "1:1", "negotiation"] : []),
    ],
  })),
  {
    answer:
      "You can sign up for the Essential plan on the Join page (/join). You'll set up a Direct Debit through GoCardless, then create your password and get access to the members area. If you'd rather talk it through first, book a call on the Contact page (/contact).",
    keywords: ["join", "sign", "signup", "register", "start", "become", "member", "apply", "enrol", "enroll"],
  },
];

const STOPWORDS = new Set(
  "a an the i me my we you your our us is are am be do does did can could will would should how what when where why who which of to in on for and or it its this that with at by from about any there have has please tell know".split(
    " ",
  ),
);

function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9£:]+/g) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .map(stem);
}

// Precomputed: strong keywords count double, words from the question once.
const INDEX = ENTRIES.map((e) => {
  const weights = new Map<string, number>();
  for (const w of tokens(e.question ?? "")) weights.set(w, 1);
  for (const k of e.keywords) weights.set(stem(k.toLowerCase()), 2);
  return { answer: e.answer, weights };
});

const GREETING = /^(hi|hello|hey|hiya|good (morning|afternoon|evening))\b/i;

export function answerFromFaq(message: string): string {
  const words = tokens(message);

  let best: { answer: string; score: number } | null = null;
  for (const entry of INDEX) {
    let score = 0;
    for (const w of new Set(words)) score += entry.weights.get(w) ?? 0;
    if (!best || score > best.score) best = { answer: entry.answer, score };
  }

  if (best && best.score >= 2) return best.answer;
  return GREETING.test(message.trim()) ? GREETING_REPLY : NO_MATCH_REPLY;
}
