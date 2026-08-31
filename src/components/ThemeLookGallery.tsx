import type { ThemeCategory } from "@/lib/schema";
import type { RoomType } from "@/lib/roomTypes";
import { THEME_STYLES } from "@/lib/themeStyles";
import ReferenceLookPicker from "./ReferenceLookPicker";

// Shown under the theme selector: a one-line description of the look plus
// the 3 reference images of that look in the chosen room type — the member
// picks one as their preferred design before generating (see
// ReferenceLookPicker), so they know what they're picking and steer the
// result toward it.
export default function ThemeLookGallery({
  theme,
  room,
  activeLook,
}: {
  theme: ThemeCategory;
  room: RoomType;
  activeLook: number;
}) {
  const style = THEME_STYLES[theme];
  if (!style) return null;

  const exampleImages = style.exampleImagesByRoom[room] ?? [];

  return (
    <div className="mt-6">
      <p className="text-sm text-paper-dim">{style.blurb}</p>

      {exampleImages.length > 0 && (
        <ReferenceLookPicker
          images={exampleImages}
          active={activeLook}
          label={style.label}
        />
      )}
    </div>
  );
}
