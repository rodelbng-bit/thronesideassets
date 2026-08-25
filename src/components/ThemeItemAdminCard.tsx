"use client";

import { useState } from "react";
import Image from "next/image";
import ThemeItemActiveToggle from "./ThemeItemActiveToggle";
import EditThemeItemForm from "./EditThemeItemForm";
import type { ThemeCategory } from "@/lib/schema";

export default function ThemeItemAdminCard({
  itemId,
  theme,
  name,
  category,
  imageUrl,
  searchKeywords,
  active,
}: {
  itemId: string;
  theme: ThemeCategory;
  name: string;
  category: string;
  imageUrl: string;
  searchKeywords: string;
  active: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-lg border rule bg-ink-soft p-3">
      <div className="relative aspect-square overflow-hidden rounded-md">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>
      <p className="mt-2 text-sm text-paper">{name}</p>
      <p className="text-xs text-paper-dim">{category}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={
            active ? "text-xs text-brass-bright" : "text-xs text-paper-dim"
          }
        >
          {active ? "Active" : "Inactive"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper"
          >
            {editing ? "Close" : "Edit"}
          </button>
          <ThemeItemActiveToggle itemId={itemId} initialActive={active} />
        </div>
      </div>

      {editing && (
        <EditThemeItemForm
          itemId={itemId}
          initialTheme={theme}
          initialName={name}
          initialCategory={category}
          initialSearchKeywords={searchKeywords}
          onDone={() => setEditing(false)}
        />
      )}
    </div>
  );
}
