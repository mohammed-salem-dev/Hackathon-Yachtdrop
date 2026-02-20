export type SavedBerth = {
  lat: number;
  lng: number;
  label: string;
};

const KEY = "yachtdrop_berth";

export function saveBerth(berth: SavedBerth): void {
  localStorage.setItem(KEY, JSON.stringify(berth));
}

export function getSavedBerth(): SavedBerth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBerth(): void {
  localStorage.removeItem(KEY);
}
