// Single source of truth for real business facts shown on the FAQ and
// Pricing pages — also used to ground the chat widget's answers so it
// never has to invent pricing, terms, or policy.

export const faqs = [
  {
    q: "What are your fees?",
    a: "Our membership starts at £497/month (Essential), on a fixed 12-month contract billed monthly. You can instead pay the full 12-month term upfront in one payment — £4,970 for Essential, saving £994. See the plans above for full details.",
  },
  {
    q: "How does the 3-month partner programme work?",
    a: "For a limited number of investors, we waive our sourcing fees for the first 3 months. You get full access to vetted deals while we build a working relationship. After 3 months, you continue on your chosen plan.",
  },
  {
    q: "What kind of deals do you source?",
    a: "We source across multiple strategies: Rent-to-Rent (R2R), Serviced Accommodation (SA), HMO, Buy-to-Let, and BRRR — matched to your investment criteria.",
  },
  {
    q: "How quickly will I see deals?",
    a: "Once onboarded, our team begins sourcing immediately. Typical timeline: 1-4 weeks for your first vetted deal, depending on your criteria and market availability. We send weekly updates regardless.",
  },
  {
    q: "Do I have to take a deal?",
    a: "No. We present you with opportunities and the numbers — you decide. There's never an obligation to proceed on any deal we show you.",
  },
];

export const plans = [
  {
    name: "Essential",
    price: "£497/month",
    term: "12-month contract, billed monthly",
    priceNote:
      "Or £4,970 upfront — the full 12-month term paid in one payment (save £994)",
    features: [
      "Unlimited deal alerts (FCFS)",
      "Full deal packs with P&L",
      "R2SA news & hot area feeds",
      "Referral to vetted management & cleaners",
      "Member community access",
      "No 1:1 support",
    ],
  },
  {
    name: "Growth Package",
    price: "£797/month",
    term: "12-month contract, billed monthly",
    priceNote:
      "Or £7,970 upfront — the full 12-month term paid in one payment (save £1,594)",
    features: [
      "Everything in Essential",
      "Priority deal alerts (before Essential tier)",
      "Monthly 1:1 strategy call",
      "Deal negotiation guidance",
      "Investor resources & templates",
    ],
    comingSoon: true,
  },
];
