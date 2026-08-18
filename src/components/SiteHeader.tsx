import Image from "next/image";
import Link from "next/link";
import { navLinks } from "./nav-links";
import MobileMenu from "./MobileMenu";
import SignOutButton from "./SignOutButton";
import { auth } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b rule bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
          <MobileMenu />
          {isLoggedIn ? (
            <>
              <Link
                href="/members"
                className="text-sm text-paper-dim transition-colors hover:text-paper"
              >
                Members
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
    </header>
  );
}
