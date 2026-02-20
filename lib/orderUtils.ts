export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `YD-${timestamp}-${random}`;
}

export type TimeSlot = "morning" | "afternoon" | "evening";

export const timeSlotLabels: Record<TimeSlot, string> = {
  morning: "Morning  (08:00 – 12:00)",
  afternoon: "Afternoon (12:00 – 17:00)",
  evening: "Evening  (17:00 – 21:00)",
};
