import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { CURRENT_TERMS_VERSION } from "@/lib/siteFacts";
import TermsGate from "@/components/TermsGate";

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let needsAcceptance = false;

  if (session?.user) {
    const [user] = await db
      .select({ termsVersionAccepted: users.termsVersionAccepted })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    needsAcceptance = user?.termsVersionAccepted !== CURRENT_TERMS_VERSION;
  }

  return (
    <>
      <TermsGate needsAcceptance={needsAcceptance} />
      {children}
    </>
  );
}
