import { useState } from "react";
import type { ProductItem } from "@/lib/scraper";

type AiMatchState = {
  isLoading: boolean;
  matches: ProductItem[];
  error: string | null;
};

export function useAiMatch() {
  const [state, setState] = useState<AiMatchState>({
    isLoading: false,
    matches: [],
    error: null,
  });

  async function findMatches(problem: string) {
    if (!problem.trim()) return;

    setState({ isLoading: true, matches: [], error: null });

    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problem.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          isLoading: false,
          matches: [],
          error: data.error ?? "Something went wrong.",
        });
        return;
      }

      setState({ isLoading: false, matches: data.matches ?? [], error: null });
    } catch {
      setState({
        isLoading: false,
        matches: [],
        error: "Connection error. Please try again.",
      });
    }
  }

  function clearMatches() {
    setState({ isLoading: false, matches: [], error: null });
  }

  return { ...state, findMatches, clearMatches };
}
