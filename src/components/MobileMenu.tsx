"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "./nav-links";
import SignOutButton from "./SignOutButton";

const rowClass =
  "border-b rule py-3 text-sm text-paper-dim transition-colors last:border-b-0 hover:text-paper";

export default function MobileMenu({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border rule text-lg text-paper"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b rule bg-ink/95 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-2">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className={rowClass}>
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <Link href="/admin/deals/new" onClick={close} className={rowClass}>
                  Upload deal
                </Link>
                <Link href="/admin/call-screener" onClick={close} className={rowClass}>
                  Screener
                </Link>
                <Link href="/admin/viewing-requests" onClick={close} className={rowClass}>
                  Viewings
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <>
                <Link href="/members" onClick={close} className={rowClass}>
                  Members
                </Link>
                <Link href="/members/account" onClick={close} className={rowClass}>
                  My account
                </Link>
                <div className="border-b rule py-3 last:border-b-0" onClick={close}>
                  <SignOutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className={rowClass}>
                  Login
                </Link>
                <Link
                  href="/join"
                  onClick={close}
                  className="border-b rule py-3 text-sm font-medium text-brass-bright transition-colors last:border-b-0 hover:text-paper"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
