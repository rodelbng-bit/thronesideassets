"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "./nav-links";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

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
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b rule py-3 text-sm text-paper-dim transition-colors last:border-b-0 hover:text-paper"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
