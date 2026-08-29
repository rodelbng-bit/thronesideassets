import Image from "next/image";
import type { ThemeCategory } from "@/lib/schema";
import { THEME_STYLES } from "@/lib/themeStyles";

// Shown under the theme selector: a one-line description of the look plus a
// few reference images, so the member knows what they're picking before
// spending a generation on it.
export default function ThemeLookGallery({ theme }: { theme: ThemeCategory }) {
  const style = THEME_STYLES[theme];
  if (!style) return null;

  return (
    <div className="mt-6">
      <p className="text-sm text-paper-dim">{style.blurb}</p>

      {style.exampleImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {style.exampleImages.map((src, i) => (
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
