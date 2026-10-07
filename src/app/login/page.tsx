import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/LoginForm";
import { auth } from "@/lib/auth";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Log In",
  ...noIndex,
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.isAdmin ? "/admin/deals/new" : "/members");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-20">
        <p className="eyebrow">
          MEMBER LOGIN
        </p>
        <h1 className="enter mt-4 font-display text-4xl text-paper [animation-delay:90ms] md:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-4 text-paper-dim">
          Log in with the email and password you set up when you joined.
        </p>

        <div className="mt-10">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
