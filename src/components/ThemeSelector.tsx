"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const THEMES = ["natural", "urban", "classy", "abstract"] as const;

export default function ThemeSelector({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(theme: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", theme);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          onClick={() => select(theme)}
          className={`rounded-full border rule px-5 py-2 text-sm transition-colors ${
            active === theme
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
