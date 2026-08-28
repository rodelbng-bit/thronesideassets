"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const THEMES = ["natural", "urban", "classy", "abstract"] as const;

export default function ThemeSelector({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Highlight the picked theme the instant it's clicked; React reverts to
  // `active` once the new grid has streamed in.
  const [shownTheme, setShownTheme] = useOptimistic(active);

  function select(theme: string) {
    if (theme === shownTheme) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", theme);
    startTransition(() => {
      setShownTheme(theme);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={`flex flex-wrap gap-2 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          onClick={() => select(theme)}
          aria-pressed={shownTheme === theme}
          className={`rounded-full border rule px-5 py-2 text-sm transition-colors ${
            shownTheme === theme
              ? "bg-brass text-ink"
              : "text-paper-dim hover:text-paper"
          }`}
        >
          {theme[0].toUpperCase() + theme.slice(1)}
        </button>
      ))}
    </div>
  );
}
