export type RoomType = "bedroom" | "living-room" | "kitchen" | "dining-room";

export const ROOM_TYPES: RoomType[] = [
  "bedroom",
  "living-room",
  "kitchen",
  "dining-room",
];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Bedroom",
  "living-room": "Living Room",
  kitchen: "Kitchen",
  "dining-room": "Dining Room",
};

export function getRoomTypeLabel(room: string): string {
  return ROOM_TYPE_LABELS[room as RoomType] ?? room;
}
