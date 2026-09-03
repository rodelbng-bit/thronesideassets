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

// Bump whenever termsSections/termsIntro below materially change — every
// member whose users.termsVersionAccepted doesn't match this gets the
// TermsGate pop-up on their next /members visit until they re-agree.
export const CURRENT_TERMS_VERSION = "2026-09-03";

export const termsIntro =
  "These Terms & Conditions (\"Terms\") govern access to and use of the " +
  "Throneside membership platform and deal-sourcing service " +
  "(\"Throneside\", \"we\", \"us\", \"our\") by any individual or entity " +
  "who subscribes as a member (\"Client\", \"Member\", \"you\"). By " +
  "submitting payment details, completing the application process, or " +
  "accessing any deal on the Throneside platform, you confirm that you " +
  "have read, understood, and agree to be bound by these Terms in full.";

export const termsSections = [
  {
    heading: "1. Nature of Our Service",
    paragraphs: [
      "Throneside operates a property deal-sourcing membership service across the United Kingdom, with expansion into further territories planned. Our role is strictly limited to the following:",
    ],
    bullets: [
      "Identifying, qualifying, and packaging company-let property opportunities sourced from landlords and letting agencies.",
      "Publishing those opportunities to Members via the Throneside platform.",
      "Facilitating an introduction between the Member and the property opportunity.",
    ],
    trailingParagraphs: [
      "Throneside acts solely as an introducer and connector between Members and property opportunities. We are not a letting agent acting on behalf of any landlord, we are not a party to any tenancy, lease, or company-let agreement entered into by a Member, and we do not operate, manage, or have any involvement in the serviced accommodation business run by any Member. Our function ends once a suitable introduction has been made and the relevant deal information has been provided.",
    ],
  },
  {
    heading: "2. No Liability for Landlords or Third Parties",
    paragraphs: [
      "Throneside carries out reasonable due diligence when sourcing and qualifying deals, but we do not guarantee, warrant, or accept responsibility for the conduct, solvency, representations, property condition, or performance of any landlord, letting agent, or other third party introduced to a Member. Any agreement a Member enters into with a landlord or letting agent is a matter strictly between those parties.",
      "To the fullest extent permitted by law, Throneside accepts no liability whatsoever for:",
    ],
    bullets: [
      "Any breach of contract, misrepresentation, or negligence by a landlord or letting agent.",
      "The condition, safety, compliance, or legal status of any property introduced.",
      "Any financial loss, dispute, or legal claim arising between a Member and a landlord or letting agent.",
    ],
  },
  {
    heading: "3. No Liability for Member Conduct or Property Damage",
    paragraphs: [
      "Once an introduction has been made, all dealings with the property — including its use, management, and operation as a serviced accommodation — are the sole responsibility of the Member. Throneside accepts no liability, and shall have no legal exposure of any kind, for:",
    ],
    bullets: [
      "Any damage caused to a landlord's property by the Member, their guests, contractors, or agents.",
      "Any breach by the Member of the terms of their tenancy, company-let, or management agreement with the landlord.",
      "Any claim, dispute, legal action, or financial demand brought by a landlord against a Member in connection with the condition, use, or mistreatment of the property.",
    ],
    trailingParagraphs: [
      "The Member agrees to indemnify and hold Throneside harmless against any losses, costs, claims, or reputational harm arising from the Member's actions, omissions, or conduct in relation to any property introduced through the platform.",
    ],
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
