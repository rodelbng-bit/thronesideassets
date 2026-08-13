import Link from "next/link";
import { navLinks } from "./nav-links";
import MobileMenu from "./MobileMenu";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b rule bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight text-paper">
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
          <Link
            href="/login"
            className="text-sm text-paper-dim transition-colors hover:text-paper"
          >
            Login
          </Link>
          <a
            href="https://api.leadconnectorhq.com/widget/booking/u1093rNHSQ03sJCDKKFF"
            className="rounded-full bg-brass px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
          >
            Register
          </a>
        </div>
      </div>
    </header>
  );
}
