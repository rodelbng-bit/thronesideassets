import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { formatUkDateTime, getApplications } from "@/lib/applicationServer";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  started: { label: "Didn't finish", className: "border-paper-dim/40 text-paper-dim" },
  disqualified: { label: "Not eligible", className: "border-red-400/50 text-red-300" },
  completed: { label: "Finished — no call booked", className: "border-brass/50 text-brass-bright" },
  booked: { label: "Call booked", className: "border-emerald-400/50 text-emerald-300" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "booked", label: "Call booked" },
  { key: "completed", label: "No call booked" },
  { key: "started", label: "Didn't finish" },
  { key: "disqualified", label: "Not eligible" },
];

export default async function ApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(user?.email)) {
    redirect("/members");
  }

  const { status = "all" } = await searchParams;
  const all = await getApplications();
  const applications = status === "all" ? all : all.filter((a) => a.status === status);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Deal access applications.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          From the <span className="ledger-figure text-paper">/start</span>{" "}
          questionnaire. Contact details are saved at step 1, so people who
          didn&apos;t finish are listed too. Newest first.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? all.length : all.filter((a) => a.status === f.key).length;
            return (
              <a
                key={f.key}
                href={f.key === "all" ? "?" : `?status=${f.key}`}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  status === f.key ? "border-brass text-paper" : "rule text-paper-dim hover:text-paper"
                }`}
              >
                {f.label} <span className="ledger-figure">({count})</span>
              </a>
            );
          })}
        </nav>

        {applications.length === 0 ? (
          <div className="mt-8 rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
            No applications here yet.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {applications.map((a) => {
              const badge = STATUS_LABELS[a.status] ?? STATUS_LABELS.started;
              return (
                <div key={a.id} className="rounded-lg border rule bg-ink-soft p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl text-paper">{a.fullName}</h3>
                      <p className="mt-1 text-sm text-paper-dim">
                        {a.email} · {a.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full border px-3 py-1 text-xs ${badge.className}`}>
                        {badge.label}
                      </span>
                      <p className="ledger-figure mt-2 text-xs text-paper-dim">
                        {new Date(a.createdAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <Answer label="Call booked for" value={a.appointmentAt && `${formatUkDateTime(a.appointmentAt)} (UK)`} />
                    <Answer label="Property experience" value={a.experience} />
                    <Answer label="Deals wanted" value={a.dealsWanted?.toString()} />
                    <Answer label="Location" value={a.location} />
                    <Answer label="Capital available" value={a.capital} />
                    <Answer
                      label="Ad source"
                      value={[a.funnel, a.utmSource, a.utmCampaign, a.utmContent].filter(Boolean).join(" · ")}
                    />
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Answer({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-paper-dim">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-paper">{value || "—"}</dd>
    </div>
  );
}
