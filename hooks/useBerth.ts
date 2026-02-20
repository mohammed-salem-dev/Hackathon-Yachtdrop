import { useState, useEffect, useCallback } from "react";
import {
  getSavedBerth,
  saveBerth,
  clearBerth,
  type SavedBerth,
} from "@/lib/orderStorage";

export function useBerth() {
  const [savedBerth, setSavedBerth] = useState<SavedBerth | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setSavedBerth(getSavedBerth());
    setIsHydrated(true);
  }, []);

  const setBerth = useCallback((berth: SavedBerth) => {
    saveBerth(berth);
    setSavedBerth(berth);
  }, []);

  const removeBerth = useCallback(() => {
    clearBerth();
    setSavedBerth(null);
  }, []);

  return { savedBerth, isHydrated, setBerth, removeBerth };
}
