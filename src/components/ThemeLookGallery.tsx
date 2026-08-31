import Image from "next/image";
import type { ThemeCategory } from "@/lib/schema";
import type { RoomType } from "@/lib/roomTypes";
import { THEME_STYLES } from "@/lib/themeStyles";

// Shown under the theme selector: a one-line description of the look plus a
// few reference images of that look in the chosen room type, so the member
// knows what they're picking before spending a generation on it.
export default function ThemeLookGallery({
  theme,
  room,
}: {
  theme: ThemeCategory;
  room: RoomType;
}) {
  const style = THEME_STYLES[theme];
  if (!style) return null;

  const exampleImages = style.exampleImagesByRoom[room] ?? [];

  return (
    <div className="mt-6">
      <p className="text-sm text-paper-dim">{style.blurb}</p>

      {exampleImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {exampleImages.map((src, i) => (
            <div
              key={src}
              className="relative aspect-4/3 overflow-hidden rounded-lg border rule"
            >
              <Image
                src={src}
                alt={`${style.label} interior look ${i + 1}`}
                fill
                sizes="(min-width: 640px) 30vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
