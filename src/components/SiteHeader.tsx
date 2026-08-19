import Image from "next/image";
import Link from "next/link";
import { navLinks } from "./nav-links";
import MobileMenu from "./MobileMenu";
import SignOutButton from "./SignOutButton";
import { auth } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = !!session?.user?.isAdmin;

  return (
    <header className="sticky top-0 z-50 border-b rule bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg tracking-tight text-paper"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          Throneside Assets
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-paper-dim transition-colors hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} />

          <div className="hidden items-center gap-3 md:flex">
            {isAdmin && (
              <>
                <Link
                  href="/admin/deals/new"
                  className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper"
                >
                  Upload deal
                </Link>
                <Link
                  href="/admin/call-screener"
                  className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper"
                >
                  Screener
                </Link>
                <Link
                  href="/admin/viewing-requests"
                  className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper"
                >
                  Viewings
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  href="/members"
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  Members
                </Link>
                <Link
                  href="/members/account"
                  aria-label="My account"
                  className="flex h-9 w-9 items-center justify-center rounded-full border rule text-paper-dim transition-colors hover:text-paper"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4.5 w-4.5"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 19.5c1.5-3.5 5-5 7.5-5s6 1.5 7.5 5" strokeLinecap="round" />
                  </svg>
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  Login
                </Link>
                <Link
                  href="/join"
                  className="rounded-full bg-brass px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
