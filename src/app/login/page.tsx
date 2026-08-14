import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          MEMBER LOGIN
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
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
