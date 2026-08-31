"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ROOM_TYPES, ROOM_TYPE_LABELS, type RoomType } from "@/lib/roomTypes";

export default function RoomTypeSelector({ active }: { active: RoomType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Highlight the picked room the instant it's clicked; React reverts to
  // `active` once the new gallery has streamed in.
  const [shownRoom, setShownRoom] = useOptimistic(active);

  function select(room: RoomType) {
    if (room === shownRoom) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("room", room);
    startTransition(() => {
      setShownRoom(room);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={`flex flex-wrap gap-2 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {ROOM_TYPES.map((room) => (
        <button
          key={room}
          type="button"
          onClick={() => select(room)}
          aria-pressed={shownRoom === room}
          className={`rounded-full border rule px-5 py-2 text-sm transition-colors ${
            shownRoom === room
              ? "bg-brass text-ink"
              : "text-paper-dim hover:text-paper"
          }`}
        >
          {ROOM_TYPE_LABELS[room]}
        </button>
      ))}
    </div>
  );
}
