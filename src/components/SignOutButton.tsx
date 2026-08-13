"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
    >
      Log out
    </button>
  );
}
