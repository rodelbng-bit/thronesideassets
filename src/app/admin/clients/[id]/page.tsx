import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ClientApprovalStatus from "@/components/ClientApprovalStatus";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import {
  getRegistrationWithUser,
  getOtherRegistrationsByEmail,
  getRegistrationStatus,
  stageLabel,
} from "@/lib/registrations";
import type { Registration } from "@/lib/schema";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB");
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const registrationStatusLabel: Record<string, string> = {
  in_progress: "In Progress",
  completed: "Completed",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </p>
      <p className="mt-1 text-sm text-paper">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border rule bg-ink-soft p-6">
      <h2 className="font-display text-lg text-paper">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(adminUser?.email)) {
    redirect("/members");
  }

  const { id } = await params;
  const row = await getRegistrationWithUser(id);
  if (!row) {
    redirect("/admin/clients");
  }
  const { registration, user } = row;

  const otherAttempts = await getOtherRegistrationsByEmail(
    registration.email,
    registration.id
  );

  const status = getRegistrationStatus(registration);
  const registrationStatusText =
    status === "abandoned"
      ? `Abandoned at ${stageLabel[registration.stage] ?? registration.stage}`
      : registrationStatusLabel[status];

  const applicationStatus = !user
    ? "Prospect"
    : user.approvalStatus === "pending"
      ? "Applicant"
      : user.approvalStatus === "approved"
        ? "Active Member"
        : "Rejected";

  const timeline: { label: string; at: Date | string | null }[] = [
    { label: "Contact Details Completed", at: registration.startedAt },
    { label: "Screening Completed", at: registration.screeningCompletedAt },
    { label: "Plan Selected", at: registration.planSelectedAt },
    { label: "Payment Started", at: registration.checkoutStartedAt },
    { label: "Payment Completed", at: registration.paidAt },
  ].filter((step) => step.at);

  const contractEndDate =
    user?.termsAcceptedAt && user.approvalStatus === "approved"
      ? addMonths(new Date(user.termsAcceptedAt), 12)
      : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Link
          href="/admin/clients"
          className="text-xs text-paper-dim hover:text-paper"
        >
          ← Back to clients
        </Link>
        <p className="ledger-figure mt-4 text-sm text-brass-bright">
          ADMIN · CLIENT PROFILE
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          {registration.name}
        </h1>

        <div className="mt-10 space-y-6">
          <Section title="Contact Information">
            <Field label="Full name" value={registration.name} />
            <Field label="Mobile number" value={registration.phone} />
            <Field label="Email address" value={registration.email} />
            <Field
              label="Date/time registered"
              value={formatDate(registration.startedAt)}
            />
            <Field
              label="Source / referral"
              value={registration.source ?? "Direct / Unknown"}
            />
          </Section>

          <Section title="Screening Information">
            {registration.screeningCompletedAt ? (
              <>
                <Field
                  label="Company name"
                  value={registration.companyName ?? "—"}
                />
                <Field
                  label="Previous property experience"
                  value={registration.experienceLevel ?? "—"}
                />
                <Field
                  label="Guarantor"
                  value={
                    registration.hasGuarantor === null
                      ? "—"
                      : registration.hasGuarantor
                        ? "Yes"
                        : "No"
                  }
                />
                <Field
                  label="Property / Airbnb goals"
                  value={registration.goals ?? "—"}
                />
              </>
            ) : (
              <p className="text-sm text-paper-dim">Not yet completed.</p>
            )}
          </Section>

          <Section title="Payment Information">
            <Field
              label="Selected plan"
              value={registration.interval ? "Essential" : "—"}
            />
            <Field
              label="Monthly or annual"
              value={registration.interval ?? "—"}
            />
            <Field
              label="Payment / Direct Debit status"
              value={user ? user.subscriptionStatus : "Not yet paid"}
            />
            <Field
              label="Date payment completed"
              value={formatDate(registration.paidAt)}
            />
          </Section>

          <Section title="Registration Information">
            <Field
              label="Current registration stage"
              value={stageLabel[registration.stage] ?? registration.stage}
            />
            <Field label="Registration status" value={registrationStatusText} />
            <Field
              label={
                status === "abandoned" ? "Date/time abandoned" : "Last interaction"
              }
              value={formatDate(registration.updatedAt)}
            />
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-paper-dim">
                Stage timeline
              </p>
              <ul className="mt-2 space-y-1">
                {timeline.map((step) => (
                  <li key={step.label} className="text-sm text-paper">
                    <span className="text-paper-dim">{step.label}:</span>{" "}
                    {formatDate(step.at)}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section title="Membership Information">
            <Field label="Application status" value={applicationStatus} />
            <div>
              <p className="text-xs uppercase tracking-wide text-paper-dim">
                Approval status
              </p>
              <div className="mt-1">
                {user ? (
                  <ClientApprovalStatus
                    userId={user.id}
                    initialStatus={user.approvalStatus}
                  />
                ) : (
                  <p className="text-sm text-paper">
                    Not yet applicable — no account linked
                  </p>
                )}
              </div>
            </div>
            <Field
              label="Membership activation date"
              value={formatDate(user?.approvedAt)}
            />
            <Field
              label="Contract start date"
              value={formatDate(user?.termsAcceptedAt)}
            />
            <Field
              label="Contract end date"
              value={contractEndDate ? formatDate(contractEndDate) : "—"}
            />
          </Section>

          {otherAttempts.length > 0 && (
            <div className="rounded-lg border rule bg-ink-soft p-6">
              <h2 className="font-display text-lg text-paper">
                Other registration attempts
              </h2>
              <ul className="mt-4 space-y-2">
                {otherAttempts.map((attempt: Registration) => (
                  <li key={attempt.id}>
                    <Link
                      href={`/admin/clients/${attempt.id}`}
                      className="text-sm text-paper-dim hover:text-brass-bright"
                    >
                      {formatDate(attempt.startedAt)} —{" "}
                      {stageLabel[attempt.stage] ?? attempt.stage}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
